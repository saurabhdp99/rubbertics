import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

const getNextCode = (items) => {
  const maxNum = items.reduce((max, t) => {
    const match = String(t.transporterCode || '').match(/^TRN(\d+)$/i);
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `TRN${String(maxNum + 1).padStart(4, '0')}`;
};

export const useTransportMasterStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  transporters: [],
  isLoading: false,
  error: null,

  searchQuery: '',
  typeFilter: 'All',
  statusFilter: 'All',
  currentPage: 1,
  itemsPerPage: 10,

  lookups: {
    transporterType: ['Road Transport', 'Courier', 'Tempo', 'Truck', 'Container', 'Local Transport'],
    defaultPaymentTerms: ['Immediate', '7 Days', '15 Days', '30 Days', '45 Days', '60 Days'],
    defaultFreightType: ['Fixed', 'Per Kg', 'Per Ton', 'Per Km', 'Per Box', 'Per Bag'],
    status: ['Active', 'Inactive', 'Blacklisted', 'On Hold'],
  },

  notifications: [],

  addNotification: (message, type = 'success') => {
    const id = Date.now();
    set(state => ({ notifications: [...state.notifications, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ notifications: state.notifications.filter(n => n.id !== id) }));
    }, 3000);
  },

  // ── Supabase CRUD ──────────────────────────────────────────────────────

  fetchTransporters: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });

    // Fetch lookups
    const { data: lookupsData } = await supabase
      .from('app_lookups')
      .select('*')
      .eq('org_id', orgId);

    const { data, error } = await supabase
      .from('transport_master')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load transport master.', 'error');
      return;
    }

    set(state => {
      const newLookups = { ...state.lookups };
      if (lookupsData) {
        lookupsData.forEach(item => {
          if (newLookups[item.type] && !newLookups[item.type].includes(item.value)) {
            newLookups[item.type] = [...newLookups[item.type], item.value];
          }
        });
      }
      return { 
        transporters: (data || []).map(mapFromDb), 
        isLoading: false,
        lookups: newLookups
      };
    });
  },

  getNextTransporterCode: () => getNextCode(get().transporters),

  addTransporter: async (data, orgId, userId) => {
    const transporterCode = data.transporterCode || getNextCode(get().transporters);
    const payload = mapToDb({ ...data, transporterCode }, orgId, userId);
    const { data: row, error } = await supabase
      .from('transport_master')
      .insert([payload])
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to create transporter: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ transporters: [mapFromDb(row), ...state.transporters], currentPage: 1 }));
    get().addNotification(`Transporter ${transporterCode} created successfully!`, 'success');
    return true;
  },

  updateTransporter: async (id, data, userId) => {
    const payload = { ...mapToDb(data), updated_by: userId };
    const { data: row, error } = await supabase
      .from('transport_master')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to update transporter: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ transporters: state.transporters.map(t => (t.id === id ? mapFromDb(row) : t)) }));
    get().addNotification('Transport master updated successfully!', 'success');
    return true;
  },

  deleteTransporter: async (id) => {
    const { error } = await supabase.from('transport_master').delete().eq('id', id);
    if (error) {
      get().addNotification(`Failed to delete transporter: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ transporters: state.transporters.filter(t => t.id !== id) }));
    get().addNotification('Transport master deleted.', 'error');
    return true;
  },

  // ── Lookup management ─────────────────────────────────────
  addLookupOption: async (fieldKey, value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return false;
    
    const orgId = useAuthStore.getState().currentOrg?.id;
    let wasAdded = false;

    const currentLocal = get().lookups[fieldKey] || [];
    if (currentLocal.some(o => o.toLowerCase() === cleaned.toLowerCase())) return false;

    if (orgId) {
      const { error } = await supabase
        .from('app_lookups')
        .insert([{ org_id: orgId, type: fieldKey, value: cleaned }]);
      if (error) {
        get().addNotification(`Failed to save: ${error.message}`, 'error');
        return false;
      }
    }

    set(state => {
      const current = state.lookups[fieldKey] || [];
      if (current.some(o => o.toLowerCase() === cleaned.toLowerCase())) return state;
      wasAdded = true;
      return { lookups: { ...state.lookups, [fieldKey]: [...current, cleaned] } };
    });
    if (wasAdded) get().addNotification(`"${cleaned}" added`, 'success');
    return wasAdded;
  },

  renameLookupOption: async (fieldKey, oldValue, newValue) => {
    const cleaned = String(newValue || '').trim();
    if (!fieldKey || !oldValue || !cleaned) return false;
    
    const orgId = useAuthStore.getState().currentOrg?.id;
    if (orgId) {
      const { error } = await supabase
        .from('app_lookups')
        .update({ value: cleaned })
        .eq('org_id', orgId)
        .eq('type', fieldKey)
        .eq('value', oldValue);
      if (error) {
        get().addNotification(`Failed to update: ${error.message}`, 'error');
        return false;
      }
    }

    let renamed = false;
    set(state => {
      const current = state.lookups[fieldKey] || [];
      if (current.some(o => o.toLowerCase() === cleaned.toLowerCase() && o !== oldValue)) return state;
      renamed = true;
      return {
        lookups: { ...state.lookups, [fieldKey]: current.map(o => (o === oldValue ? cleaned : o)) },
        transporters: state.transporters.map(t =>
          t[fieldKey] === oldValue ? { ...t, [fieldKey]: cleaned } : t
        ),
      };
    });
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deleteLookupOption: async (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().transporters.filter(t => t[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} transporter(s).`, 'error');
      return false;
    }
    
    const orgId = useAuthStore.getState().currentOrg?.id;
    if (orgId) {
      const { error } = await supabase
        .from('app_lookups')
        .delete()
        .eq('org_id', orgId)
        .eq('type', fieldKey)
        .eq('value', value);
      if (error) {
        get().addNotification(`Failed to delete: ${error.message}`, 'error');
        return false;
      }
    }

    set(state => ({
      lookups: { ...state.lookups, [fieldKey]: (state.lookups[fieldKey] || []).filter(o => o !== value) },
    }));
    get().addNotification(`"${value}" deleted`, 'error');
    return true;
  },

  // ── UI ─────────────────────────────────────────────────────────────────
  setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),
  setTypeFilter: (t) => set({ typeFilter: t, currentPage: 1 }),
  setStatusFilter: (s) => set({ statusFilter: s, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),

  getFilteredTransporters: () => {
    const { transporters, searchQuery, typeFilter, statusFilter } = get();
    const q = searchQuery.toLowerCase().trim();
    return transporters.filter(t => {
      const matchSearch = !q || Object.values(t).some(v => String(v || '').toLowerCase().includes(q));
      const matchType = typeFilter === 'All' || t.transporterType === typeFilter;
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  },

  getStats: () => {
    const { transporters } = get();
    return {
      total: transporters.length,
      active: transporters.filter(t => t.status === 'Active').length,
      inactiveOrHold: transporters.filter(t => t.status === 'Inactive' || t.status === 'On Hold').length,
      blacklisted: transporters.filter(t => t.status === 'Blacklisted').length,
    };
  },
}));

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapFromDb(row) {
  return {
    id: row.id,
    orgId: row.org_id,
    transporterCode: row.transporter_code,
    transporterName: row.transporter_name,
    trasnporterAdd: row.transporter_add,
    gstNo: row.gst_no,
    panNo: row.pan_no,
    transporterType: row.transporter_type,
    transporterId: row.transporter_id,
    contactPerson: row.contact_person,
    mobileNo: row.mobile_no,
    alternateMobileNo: row.alternate_mobile_no,
    email: row.email,
    website: row.website,
    defaultPaymentTerms: row.default_payment_terms,
    defaultFreightType: row.default_freight_type,
    status: row.status,
    remarks: row.remarks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapToDb(data, orgId, userId) {
  const payload = {
    transporter_code: data.transporterCode,
    transporter_name: data.transporterName,
    transporter_add: data.trasnporterAdd,
    gst_no: data.gstNo,
    pan_no: data.panNo,
    transporter_type: data.transporterType || 'Road Transport',
    transporter_id: data.transporterId,
    contact_person: data.contactPerson,
    mobile_no: data.mobileNo,
    alternate_mobile_no: data.alternateMobileNo,
    email: data.email,
    website: data.website,
    default_payment_terms: data.defaultPaymentTerms || '30 Days',
    default_freight_type: data.defaultFreightType || 'Per Kg',
    status: data.status || 'Active',
    remarks: data.remarks,
  };
  if (orgId) payload.org_id = orgId;
  if (userId) payload.created_by = userId;
  return payload;
}
