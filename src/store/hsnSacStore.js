import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useHsnSacStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  items: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  currentPage: 1,
  itemsPerPage: 10,
  notifications: [],

  // ── Notification helper ────────────────────────────────────────────────
  addNotification: (message, type = 'success') => {
    const id = Date.now();
    set(state => ({ notifications: [...state.notifications, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ notifications: state.notifications.filter(n => n.id !== id) }));
    }, 3000);
  },

  // ── Supabase CRUD ──────────────────────────────────────────────────────

  fetchItems: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from('hsn_sac_master')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load HSN/SAC master.', 'error');
      return;
    }
    set({ items: (data || []).map(mapFromDb), isLoading: false });
  },

  addItem: async (itemData, orgId, userId) => {
    const payload = {
      org_id: orgId,
      hsn_code: itemData.hsnCode,
      description: itemData.description,
      gst_percentage: String(itemData.gstPercentage || '18'),
      effective_from: itemData.effectiveFrom || null,
      effective_to: itemData.effectiveTo || null,
      created_by: userId,
    };
    const { data, error } = await supabase
      .from('hsn_sac_master')
      .insert([payload])
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to create HSN/SAC: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ items: [mapFromDb(data), ...state.items], currentPage: 1 }));
    get().addNotification('HSN/SAC master created successfully!', 'success');
    return true;
  },

  updateItem: async (id, itemData, userId) => {
    const payload = {
      hsn_code: itemData.hsnCode,
      description: itemData.description,
      gst_percentage: String(itemData.gstPercentage || '18'),
      effective_from: itemData.effectiveFrom || null,
      effective_to: itemData.effectiveTo || null,
      updated_by: userId,
    };
    const { data, error } = await supabase
      .from('hsn_sac_master')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to update HSN/SAC: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ items: state.items.map(i => (i.id === id ? mapFromDb(data) : i)) }));
    get().addNotification('HSN/SAC master updated successfully!', 'success');
    return true;
  },

  deleteItem: async (id) => {
    const { error } = await supabase.from('hsn_sac_master').delete().eq('id', id);
    if (error) {
      get().addNotification(`Failed to delete HSN/SAC: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ items: state.items.filter(i => i.id !== id) }));
    get().addNotification('HSN/SAC master deleted.', 'error');
    return true;
  },

  // ── UI ─────────────────────────────────────────────────────────────────
  setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),

  getFilteredItems: () => {
    const { items, searchQuery } = get();
    const q = searchQuery.toLowerCase().trim();
    return items.filter(item =>
      !q || Object.values(item).some(v => String(v || '').toLowerCase().includes(q))
    );
  },

  getStats: () => ({ total: get().items.length }),
}));

function mapFromDb(row) {
  return {
    id: row.id,
    orgId: row.org_id,
    hsnCode: row.hsn_code,
    description: row.description,
    gstPercentage: row.gst_percentage,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
