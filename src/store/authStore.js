import { create } from 'zustand';
import { supabase } from '../lib/supabase';

// Persist selected org in localStorage so it survives tab closes and browser reopens
const CURRENT_ORG_KEY = 'rubbertics_current_org';

export const useAuthStore = create((set, get) => ({
  // ─── Auth state ──────────────────────────────────────────────────────
  isAuthenticated: false,
  currentUser: null,   // { id, email, name, role, staff_id, is_active }
  authError: null,
  isLoading: false,
  isInitialized: false,
  _profileChannel: null,

  // ─── Organization state ──────────────────────────────────────────────
  organizations: [],
  currentOrg: null,    // { id, name, industry, size }
  orgsLoading: false,
  staffOrgAccessMap: {}, // { [orgId]: ['/orders', ...] }

  // ─── Initialize (call once on app mount) ────────────────────────────
  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await get()._fetchProfile(session.user.id);
      
      if (!profile || !profile.is_active) {
        await supabase.auth.signOut();
        localStorage.removeItem(CURRENT_ORG_KEY);
        set({ isAuthenticated: false, currentUser: null, currentOrg: null, organizations: [], isInitialized: true });
        return;
      }

      // Restore previously selected org from localStorage
      const storedOrg = localStorage.getItem(CURRENT_ORG_KEY);
      const currentOrg = storedOrg ? JSON.parse(storedOrg) : null;
      set({ isAuthenticated: true, currentUser: profile, currentOrg, isInitialized: true });
      // Load orgs in background
      get().loadOrganizations();
      get()._setupRealtimeProfileListener(profile.id);
    } else {
      set({ isInitialized: true });
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      // Prevent redundant fetches if the user is already authenticated and loaded
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          // If we already have the current user loaded in state, no need to refetch everything
          if (get().currentUser?.id === session.user.id) return;

          const profile = await get()._fetchProfile(session.user.id);
          if (!profile || !profile.is_active) {
            await supabase.auth.signOut();
            localStorage.removeItem(CURRENT_ORG_KEY);
            set({ isAuthenticated: false, currentUser: null, currentOrg: null, organizations: [] });
            return;
          }
          const storedOrg = localStorage.getItem(CURRENT_ORG_KEY);
          const currentOrg = storedOrg ? JSON.parse(storedOrg) : null;
          set({ isAuthenticated: true, currentUser: profile, currentOrg });
          get().loadOrganizations();
          get()._setupRealtimeProfileListener(profile.id);
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem(CURRENT_ORG_KEY);
        set({ isAuthenticated: false, currentUser: null, currentOrg: null, organizations: [] });
        get()._teardownRealtimeProfileListener();
      }
    });
  },

  // ─── Internal: fetch profile from DB ────────────────────────────────
  _fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, staff_id, is_active')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return data;
  },

  _setupRealtimeProfileListener: (userId) => {
    get()._teardownRealtimeProfileListener();
    const channel = supabase.channel(`profile-${userId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          if (payload.new && payload.new.is_active === false) {
            get().logout();
            set({ authError: 'Your account has been deactivated by an administrator.' });
          } else if (payload.new) {
            set({ currentUser: payload.new });
          }
        }
      )
      .subscribe();
    set({ _profileChannel: channel });
  },

  _teardownRealtimeProfileListener: () => {
    const channel = get()._profileChannel;
    if (channel) {
      supabase.removeChannel(channel);
      set({ _profileChannel: null });
    }
  },

  // ─── Login ──────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true, authError: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ authError: error.message, isLoading: false });
      return false;
    }
    const profile = await get()._fetchProfile(data.user.id);
    if (!profile || !profile.is_active) {
      await supabase.auth.signOut();
      set({ authError: 'Account is disabled. Contact administrator.', isLoading: false });
      return false;
    }
    set({ isAuthenticated: true, currentUser: profile, authError: null, isLoading: false });
    // Load orgs after login
    get().loadOrganizations();
    return true;
  },

  // ─── Logout ─────────────────────────────────────────────────────────
  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem(CURRENT_ORG_KEY);
    set({ isAuthenticated: false, currentUser: null, currentOrg: null, organizations: [], authError: null });
  },

  // ─── Forgot password ────────────────────────────────────────────────
  forgotPassword: async (email) => {
    set({ isLoading: true, authError: null });
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) {
      set({ authError: error.message, isLoading: false });
      return false;
    }
    set({ isLoading: false });
    return true;
  },

  // ─── Reset password ──────────────────────────────────────────────────
  resetPassword: async (newPassword) => {
    set({ isLoading: true, authError: null });
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      set({ authError: error.message, isLoading: false });
      return false;
    }
    set({ isLoading: false });
    return true;
  },

  // ─── ORGANIZATION ACTIONS ─────────────────────────────────────────────

  // Load all organizations from Supabase
  loadOrganizations: async () => {
    set({ orgsLoading: true });
    const currentUser = get().currentUser;
    const isAdmin = currentUser?.role === 'admin';

    let query = supabase.from('organizations').select('*').order('created_at', { ascending: true });

    if (!isAdmin && currentUser) {
      // Fetch orgs staff has access to
      const { data: accessData } = await supabase
        .from('staff_org_access')
        .select('org_id, allowed_pages')
        .eq('staff_id', currentUser.id);
      
      const allowedOrgIds = accessData ? accessData.map(a => a.org_id) : [];
      const accessMap = {};
      accessData?.forEach(a => { accessMap[a.org_id] = a.allowed_pages; });
      set({ staffOrgAccessMap: accessMap });
      
      if (allowedOrgIds.length === 0) {
        set({ organizations: [], orgsLoading: false });
        return;
      }
      query = query.in('id', allowedOrgIds);
    }

    const { data, error } = await query;
    if (!error) {
      const orgs = data || [];
      set({ organizations: orgs, orgsLoading: false });
      
      // Auto-select if staff and exactly 1 org, and no currentOrg is selected
      if (!isAdmin && orgs.length === 1 && !get().currentOrg) {
        get().selectOrganization(orgs[0]);
      }
    } else {
      set({ orgsLoading: false });
    }
  },

  // Select an org (persists in localStorage)
  selectOrganization: (org) => {
    if (org) {
      localStorage.setItem(CURRENT_ORG_KEY, JSON.stringify(org));
    } else {
      localStorage.removeItem(CURRENT_ORG_KEY);
    }
    set({ currentOrg: org });
  },

  // Create org (admin only)
  createOrganization: async (orgData) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    // Separate attachments from other data
    const { attachments, ...dbPayload } = orgData;
    dbPayload.created_by = userId;

    const { data, error } = await supabase
      .from('organizations')
      .insert(dbPayload)
      .select()
      .single();
      
    if (error) return { success: false, error: error.message };

    // Handle attachments upload
    let finalAttachments = [];
    if (attachments && attachments.length > 0) {
      finalAttachments = await Promise.all(attachments.map(async (att) => {
        if (att.fileObject) {
          const fileName = `${Date.now()}_${att.fileObject.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `${data.id}/organizations/${fileName}`; // Path inside attachments bucket
          const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, att.fileObject);
          if (uploadError) return att;
          const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
          return { id: att.id, name: att.name, fileName: att.fileObject.name, fileType: att.fileObject.type, fileData: publicUrl, url: publicUrl };
        }
        return att;
      }));

      // Update org with attachments
      const { data: updatedData, error: updateError } = await supabase
        .from('organizations')
        .update({ attachments: finalAttachments })
        .eq('id', data.id)
        .select()
        .single();
        
      if (!updateError && updatedData) {
        // Refresh list
        const orgs = get().organizations;
        set({ organizations: [...orgs, updatedData] });
        return { success: true, data: updatedData };
      }
    }

    // Refresh list
    const orgs = get().organizations;
    set({ organizations: [...orgs, data] });
    return { success: true, data };
  },

  // Update org (admin only)
  updateOrganization: async (id, orgData) => {
    // Separate attachments from other data
    const { attachments, ...dbPayload } = orgData;

    let finalAttachments = attachments || [];
    if (attachments && attachments.length > 0) {
      finalAttachments = await Promise.all(attachments.map(async (att) => {
        if (att.fileObject) {
          const fileName = `${Date.now()}_${att.fileObject.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `${id}/organizations/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, att.fileObject);
          if (uploadError) return att;
          const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
          return { id: att.id, name: att.name, fileName: att.fileObject.name, fileType: att.fileObject.type, fileData: publicUrl, url: publicUrl };
        }
        return att;
      }));
    }
    
    dbPayload.attachments = finalAttachments;

    const { data, error } = await supabase
      .from('organizations')
      .update(dbPayload)
      .eq('id', id)
      .select()
      .single();
      
    if (error) return { success: false, error: error.message };
    
    const orgs = get().organizations.map(o => o.id === id ? data : o);
    set({ organizations: orgs });
    
    // If we updated the currently selected org, update it too
    if (get().currentOrg?.id === id) {
      localStorage.setItem(CURRENT_ORG_KEY, JSON.stringify(data));
      set({ currentOrg: data });
    }
    return { success: true, data };
  },

  // Delete org (admin only)
  deleteOrganization: async (id) => {
    const { error } = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    const orgs = get().organizations.filter(o => o.id !== id);
    set({ organizations: orgs });
    // If deleted org was selected, clear selection
    if (get().currentOrg?.id === id) {
      localStorage.removeItem(CURRENT_ORG_KEY);
      set({ currentOrg: null });
    }
    return { success: true };
  },

  // ─── STAFF ACTIONS ────────────────────────────────────────────────────

  createStaff: async ({ email, password, name, staffId }) => {
    set({ isLoading: true, authError: null });
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) {
      set({ authError: 'Not authenticated', isLoading: false });
      return { success: false };
    }
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-staff`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, password, name, staff_id: staffId }),
      }
    );
    const result = await res.json();
    set({ isLoading: false });
    if (!res.ok) return { success: false, error: result.error || 'Failed to create staff' };
    return { success: true, data: result };
  },

  listStaff: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, staff_id, is_active, created_at')
      .eq('role', 'staff')
      .order('created_at', { ascending: false });
    if (error) return [];
    return data || [];
  },

  toggleStaffStatus: async (staffId, isActive) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', staffId);
    return !error;
  },

  removeStaff: async (staffUserId) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    if (!token) return { success: false, error: 'Not authenticated' };
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-staff`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ staff_user_id: staffUserId }),
      }
    );
    const result = await res.json();
    if (!res.ok) return { success: false, error: result.error || 'Failed to remove staff' };
    return { success: true };
  },

  getStaffOrgAccess: async (staffId) => {
    const { data, error } = await supabase
      .from('staff_org_access')
      .select('org_id, allowed_pages')
      .eq('staff_id', staffId);
    if (error) return [];
    return data;
  },

  updateStaffOrgAccess: async (staffId, orgId, hasAccess, allowedPages = null) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const adminId = sessionData?.session?.user?.id;

    if (hasAccess) {
      const { data } = await supabase.from('staff_org_access')
        .select('id').match({ staff_id: staffId, org_id: orgId }).single();
      if (data) {
        const { error } = await supabase.from('staff_org_access')
          .update({ allowed_pages: allowedPages })
          .eq('id', data.id);
        return !error;
      } else {
        const { error } = await supabase.from('staff_org_access')
          .insert({ staff_id: staffId, org_id: orgId, granted_by: adminId, allowed_pages: allowedPages });
        return !error;
      }
    } else {
      const { error } = await supabase
        .from('staff_org_access')
        .delete()
        .match({ staff_id: staffId, org_id: orgId });
      return !error;
    }
  },

  clearError: () => set({ authError: null }),

  // ─── Update own email (admin/staff) ─────────────────────────────────
  updateEmail: async (newEmail) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) return { success: false, error: error.message };
    // Also update profiles table
    const userId = get().currentUser?.id;
    if (userId) {
      await supabase.from('profiles').update({ email: newEmail }).eq('id', userId);
      set({ currentUser: { ...get().currentUser, email: newEmail } });
    }
    return { success: true };
  },

  // ─── Update own password ─────────────────────────────────────────────
  updatePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { success: false, error: error.message };
    return { success: true };
  },
}));
