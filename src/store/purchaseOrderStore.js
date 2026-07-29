import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

const DEFAULT_LOOKUPS = {
  status: ['Draft', 'Pending', 'Approved', 'Completed', 'Cancelled'],
};

export const usePurchaseOrderStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  orders: [],
  isLoading: false,
  error: null,

  // UI / filter state
  searchQuery: '',
  filterStatus: 'All',
  currentPage: 1,
  itemsPerPage: 10,
  sortField: 'date',
  sortDirection: 'desc',

  // Modal / delete state
  isDeleteConfirmOpen: false,
  orderToDelete: null,

  // Lookups (database-driven)
  purchaseOrderLookups: {},

  // Notifications
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

  fetchOrders: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });

    // Fetch PO-specific lookups (reuse app_lookups table with po_ prefix types)
    const { data: lookupsData } = await supabase
      .from('app_lookups')
      .select('*')
      .eq('org_id', orgId)
      .in('type', ['po_status', 'po_paymentTerms', 'po_deliveryTerms', 'po_uom', 'paymentTerms', 'deliveryTerms', 'uom']);

    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('org_id', orgId)
      .order('date', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load purchase orders.', 'error');
      return;
    }

    set(state => {
      let finalLookups = {};

      // Build lookups from DB — strip po_ prefix for local keys
      if (lookupsData && lookupsData.length > 0) {
        lookupsData.forEach(item => {
          const localKey = item.type.startsWith('po_') ? item.type.slice(3) : item.type;
          if (!finalLookups[localKey]) finalLookups[localKey] = [];
          if (!finalLookups[localKey].includes(item.value)) {
            finalLookups[localKey].push(item.value);
          }
        });
      }

      // Seed missing default status options
      const seedData = [];
      Object.entries(DEFAULT_LOOKUPS).forEach(([type, values]) => {
        if (!finalLookups[type]) {
          values.forEach(value => {
            seedData.push({ org_id: orgId, type: `po_${type}`, value });
          });
          finalLookups[type] = [...values];
        }
      });

      if (seedData.length > 0) {
        supabase.from('app_lookups').insert(seedData).then(({ error }) => {
          if (error) console.error('Failed to seed PO lookups:', error);
        });
      }

      return {
        orders: (data || []).map(mapFromDb),
        isLoading: false,
        purchaseOrderLookups: finalLookups,
      };
    });
  },

  addOrder: async (orderData, orgId, userId) => {
    let generatedNo = orderData.npplPoNo;
    if (!generatedNo) {
      const { orders } = get();
      const existing = orders
        .map(o => o.npplPoNo)
        .filter(n => n && n.toUpperCase().startsWith('PO-'))
        .map(n => parseInt(n.substring(3), 10))
        .filter(n => !isNaN(n));
      const maxNo = existing.length > 0 ? Math.max(...existing) : 0;
      generatedNo = `PO-${String(maxNo + 1).padStart(4, '0')}`;
      orderData.npplPoNo = generatedNo;
    }

    const payload = mapToDb(orderData, orgId, userId);
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert([payload])
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to create purchase order: ${error.message}`, 'error');
      return;
    }
    set(state => ({ orders: [mapFromDb(data), ...state.orders] }));
    get().addNotification('Purchase order created successfully!', 'success');
  },

  updateOrder: async (id, orderData, userId) => {
    const payload = { ...mapToDb(orderData), updated_by: userId, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('purchase_orders')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to update purchase order: ${error.message}`, 'error');
      return;
    }
    set(state => ({
      orders: state.orders.map(o => (o.id === id ? mapFromDb(data) : o)),
    }));
    get().addNotification('Purchase order updated successfully!', 'success');
  },

  deleteOrder: async (id) => {
    const { error } = await supabase.from('purchase_orders').delete().eq('id', id);
    if (error) {
      get().addNotification(`Failed to delete purchase order: ${error.message}`, 'error');
      return;
    }
    set(state => ({
      orders: state.orders.filter(o => o.id !== id),
    }));
    get().addNotification('Purchase order deleted.', 'success');
    set({ isDeleteConfirmOpen: false, orderToDelete: null });
  },

  // ── Lookup management ─────────────────────────────────────────────────
  addPurchaseOrderLookupOption: async (fieldKey, value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return false;

    const orgId = useAuthStore.getState().currentOrg?.id;
    const currentLocal = get().purchaseOrderLookups[fieldKey] || [];
    if (currentLocal.some(o => o.toLowerCase() === cleaned.toLowerCase())) return false;

    if (orgId) {
      const dbType = ['status'].includes(fieldKey) ? `po_${fieldKey}` : fieldKey;
      const { error } = await supabase
        .from('app_lookups')
        .insert([{ org_id: orgId, type: dbType, value: cleaned }]);
      if (error) {
        get().addNotification(`Failed to save: ${error.message}`, 'error');
        return false;
      }
    }

    let wasAdded = false;
    set(state => {
      const current = state.purchaseOrderLookups[fieldKey] || [];
      if (current.some(o => o.toLowerCase() === cleaned.toLowerCase())) return state;
      wasAdded = true;
      return { purchaseOrderLookups: { ...state.purchaseOrderLookups, [fieldKey]: [...current, cleaned] } };
    });
    if (wasAdded) get().addNotification(`"${cleaned}" added`, 'success');
    return wasAdded;
  },

  renamePurchaseOrderLookupOption: async (fieldKey, oldValue, newValue) => {
    const cleaned = String(newValue || '').trim();
    if (!fieldKey || !oldValue || !cleaned) return false;

    const orgId = useAuthStore.getState().currentOrg?.id;
    if (orgId) {
      const dbType = ['status'].includes(fieldKey) ? `po_${fieldKey}` : fieldKey;
      const { error } = await supabase
        .from('app_lookups')
        .update({ value: cleaned })
        .eq('org_id', orgId)
        .eq('type', dbType)
        .eq('value', oldValue);
      if (error) {
        get().addNotification(`Failed to update: ${error.message}`, 'error');
        return false;
      }
    }

    let renamed = false;
    set(state => {
      const current = state.purchaseOrderLookups[fieldKey] || [];
      if (current.some(o => o.toLowerCase() === cleaned.toLowerCase() && o !== oldValue)) return state;
      renamed = true;
      return {
        purchaseOrderLookups: {
          ...state.purchaseOrderLookups,
          [fieldKey]: current.map(o => (o === oldValue ? cleaned : o)),
        },
        orders: state.orders.map(o => (o[fieldKey] !== oldValue ? o : { ...o, [fieldKey]: cleaned })),
      };
    });
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deletePurchaseOrderLookupOption: async (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().orders.filter(o => o[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} order(s).`, 'error');
      return false;
    }

    const orgId = useAuthStore.getState().currentOrg?.id;
    if (orgId) {
      const dbType = ['status'].includes(fieldKey) ? `po_${fieldKey}` : fieldKey;
      const { error } = await supabase
        .from('app_lookups')
        .delete()
        .eq('org_id', orgId)
        .eq('type', dbType)
        .eq('value', value);
      if (error) {
        get().addNotification(`Failed to delete: ${error.message}`, 'error');
        return false;
      }
    }

    set(state => ({
      purchaseOrderLookups: {
        ...state.purchaseOrderLookups,
        [fieldKey]: (state.purchaseOrderLookups[fieldKey] || []).filter(o => o !== value),
      },
    }));
    get().addNotification(`"${value}" deleted`, 'error');
    return true;
  },

  // ── UI Actions ─────────────────────────────────────────────────────────
  openDeleteConfirm: (order) => set({ isDeleteConfirmOpen: true, orderToDelete: order }),
  closeDeleteConfirm: () => set({ isDeleteConfirmOpen: false, orderToDelete: null }),
  setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),
  setFilterStatus: (s) => set({ filterStatus: s, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),
  setSortField: (field) => set(state => ({
    sortField: field,
    sortDirection: state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc',
  })),

  // ── Computed selectors ─────────────────────────────────────────────────
  getFilteredOrders: () => {
    const { orders, searchQuery, filterStatus, sortField, sortDirection } = get();
    let filtered = orders.filter(o => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        (o.poNo || '').toLowerCase().includes(q) ||
        (o.npplPoNo || '').toLowerCase().includes(q) ||
        (o.vendorName || '').toLowerCase().includes(q) ||
        (o.items || []).some(i =>
          (i.partNo || '').toLowerCase().includes(q) ||
          (i.productName || '').toLowerCase().includes(q)
        );
      const matchStatus = filterStatus === 'All' || o.status === filterStatus;
      return matchSearch && matchStatus;
    });

    filtered.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  },

  getStats: () => {
    const { orders } = get();
    return {
      total: orders.length,
      draft: orders.filter(o => o.status === 'Draft').length,
      pending: orders.filter(o => o.status === 'Pending').length,
      approved: orders.filter(o => o.status === 'Approved').length,
      completed: orders.filter(o => o.status === 'Completed').length,
    };
  },
}));

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapFromDb(row) {
  return {
    id: row.id,
    date: row.date,
    npplPoNo: row.nppl_po_no || '',
    vendorName: row.vendor_name,
    vendorAddress: row.vendor_address,
    shippingAddress: row.shipping_address,
    items: row.items || [],
    paymentTerms: row.payment_terms,
    deliveryTerms: row.delivery_terms,
    transport: row.transport,
    remark: row.remark,
    status: row.status || 'Pending',
    orgId: row.org_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapToDb(data, orgId, userId) {
  const payload = {
    nppl_po_no: data.npplPoNo || null,
    vendor_name: data.vendorName,
    vendor_address: data.vendorAddress,
    shipping_address: data.shippingAddress,
    items: data.items || [],
    payment_terms: data.paymentTerms,
    delivery_terms: data.deliveryTerms,
    transport: data.transport,
    remark: data.remark,
    status: data.status || 'Pending',
    date: data.date || new Date().toISOString().split('T')[0],
  };
  if (orgId) payload.org_id = orgId;
  if (userId) payload.created_by = userId;
  return payload;
}
