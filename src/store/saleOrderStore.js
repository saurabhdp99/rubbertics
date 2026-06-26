import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useSaleOrderStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  orders: [],
  isLoading: false,
  error: null,

  // UI / filter state
  searchQuery: '',
  filterStatus: 'All',
  filterPriority: 'All',
  filterPoType: 'All',
  currentPage: 1,
  itemsPerPage: 10,
  sortField: 'date',
  sortDirection: 'desc',
  selectedOrders: [],

  // Modal state
  isModalOpen: false,
  modalMode: 'view',
  selectedOrder: null,
  isDeleteConfirmOpen: false,
  orderToDelete: null,

  // Lookups (kept in-memory, org-specific overrides possible later)
  saleOrderLookups: {
    soType: ['Sale', 'Production'],
    priority: ['Urgent', 'High', 'Medium', 'Normal', 'Low'],
    finalStatus: ['Dispatched', 'Partial Dispatch', 'Pending Dispatch', 'In Progress'],
  },

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

  /** Fetch all sale orders for the current org */
  fetchOrders: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from('sale_orders')
      .select('*')
      .eq('org_id', orgId)
      .order('date', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load sale orders.', 'error');
      return;
    }
    // Map snake_case DB columns → camelCase used in UI
    const mapped = (data || []).map(mapFromDb);
    set({ orders: mapped, isLoading: false });
  },

  addOrder: async (orderData, orgId, userId) => {
    const payload = mapToDb(orderData, orgId, userId);
    const { data, error } = await supabase
      .from('sale_orders')
      .insert([payload])
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to create order: ${error.message}`, 'error');
      return;
    }
    set(state => ({ orders: [mapFromDb(data), ...state.orders] }));
    get().addNotification('Sale order created successfully!', 'success');
    get().closeModal();
  },

  updateOrder: async (id, orderData, userId) => {
    const payload = { ...mapToDb(orderData), updated_by: userId };
    const { data, error } = await supabase
      .from('sale_orders')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to update order: ${error.message}`, 'error');
      return;
    }
    set(state => ({
      orders: state.orders.map(o => (o.id === id ? mapFromDb(data) : o)),
    }));
    get().addNotification('Order updated successfully!', 'success');
    get().closeModal();
  },

  deleteOrder: async (id) => {
    const { error } = await supabase.from('sale_orders').delete().eq('id', id);
    if (error) {
      get().addNotification(`Failed to delete order: ${error.message}`, 'error');
      return;
    }
    set(state => ({
      orders: state.orders.filter(o => o.id !== id),
      selectedOrders: state.selectedOrders.filter(sid => sid !== id),
    }));
    get().addNotification('Order deleted.', 'error');
    set({ isDeleteConfirmOpen: false, orderToDelete: null });
  },

  deleteSelectedOrders: async () => {
    const { selectedOrders } = get();
    if (!selectedOrders.length) return;
    const { error } = await supabase.from('sale_orders').delete().in('id', selectedOrders);
    if (error) {
      get().addNotification(`Failed to delete orders: ${error.message}`, 'error');
      return;
    }
    set(state => ({
      orders: state.orders.filter(o => !selectedOrders.includes(o.id)),
      selectedOrders: [],
    }));
    get().addNotification(`${selectedOrders.length} orders deleted!`, 'error');
  },

  // ── Lookup management (in-memory, can be extended to Supabase later) ──
  addSaleOrderLookupOption: (fieldKey, value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return false;
    let wasAdded = false;
    set(state => {
      const current = state.saleOrderLookups[fieldKey] || [];
      if (current.some(o => o.toLowerCase() === cleaned.toLowerCase())) return state;
      wasAdded = true;
      return { saleOrderLookups: { ...state.saleOrderLookups, [fieldKey]: [...current, cleaned] } };
    });
    if (wasAdded) get().addNotification(`"${cleaned}" added`, 'success');
    return wasAdded;
  },

  renameSaleOrderLookupOption: (fieldKey, oldValue, newValue) => {
    const cleaned = String(newValue || '').trim();
    if (!fieldKey || !oldValue || !cleaned) return false;
    let renamed = false;
    set(state => {
      const current = state.saleOrderLookups[fieldKey] || [];
      if (current.some(o => o.toLowerCase() === cleaned.toLowerCase() && o !== oldValue)) return state;
      renamed = true;
      return {
        saleOrderLookups: {
          ...state.saleOrderLookups,
          [fieldKey]: current.map(o => (o === oldValue ? cleaned : o)),
        },
        orders: state.orders.map(o => (o[fieldKey] !== oldValue ? o : { ...o, [fieldKey]: cleaned })),
      };
    });
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deleteSaleOrderLookupOption: (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().orders.filter(o => o[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} order(s).`, 'error');
      return false;
    }
    set(state => ({
      saleOrderLookups: {
        ...state.saleOrderLookups,
        [fieldKey]: (state.saleOrderLookups[fieldKey] || []).filter(o => o !== value),
      },
    }));
    get().addNotification(`"${value}" deleted`, 'error');
    return true;
  },

  // ── UI Actions ─────────────────────────────────────────────────────────
  openModal: (mode, order = null) => set({ isModalOpen: true, modalMode: mode, selectedOrder: order }),
  closeModal: () => set({ isModalOpen: false, selectedOrder: null }),
  openDeleteConfirm: (order) => set({ isDeleteConfirmOpen: true, orderToDelete: order }),
  closeDeleteConfirm: () => set({ isDeleteConfirmOpen: false, orderToDelete: null }),
  toggleSelectOrder: (id) => set(state => ({
    selectedOrders: state.selectedOrders.includes(id)
      ? state.selectedOrders.filter(sid => sid !== id)
      : [...state.selectedOrders, id],
  })),
  toggleSelectAll: (visibleIds) => {
    const { selectedOrders } = get();
    const allSelected = visibleIds.every(id => selectedOrders.includes(id));
    set({ selectedOrders: allSelected ? [] : visibleIds });
  },
  clearSelection: () => set({ selectedOrders: [] }),
  setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),
  setFilterStatus: (s) => set({ filterStatus: s, currentPage: 1 }),
  setFilterPriority: (p) => set({ filterPriority: p, currentPage: 1 }),
  setFilterPoType: (t) => set({ filterPoType: t, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),
  setSortField: (field) => set(state => ({
    sortField: field,
    sortDirection: state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc',
  })),

  // ── Computed selectors ─────────────────────────────────────────────────
  getFilteredOrders: () => {
    const { orders, searchQuery, filterStatus, filterPriority, filterPoType, sortField, sortDirection } = get();
    let filtered = orders.filter(o => {
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        (o.poNo || '').toLowerCase().includes(q) ||
        (o.partyName || '').toLowerCase().includes(q) ||
        (o.productName || '').toLowerCase().includes(q) ||
        (o.partNo || '').toLowerCase().includes(q);
      const matchStatus = filterStatus === 'All' || o.finalStatus === filterStatus;
      const matchPriority = filterPriority === 'All' || o.priority === filterPriority;
      const matchPoType = filterPoType === 'All' || o.poType === filterPoType;
      return matchSearch && matchStatus && matchPriority && matchPoType;
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
      pending: orders.filter(o => o.finalStatus === 'Pending Dispatch').length,
      dispatched: orders.filter(o => o.finalStatus === 'Dispatched').length,
      partial: orders.filter(o => o.finalStatus === 'Partial Dispatch').length,
      urgent: orders.filter(o => o.priority === 'Urgent' || o.priority === 'High').length,
      totalOrderQty: orders.reduce((s, o) => s + Number(o.orderQty || 0), 0),
      totalDispatchQty: orders.reduce((s, o) => s + Number(o.dispatchQty || 0), 0),
    };
  },
}));

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapFromDb(row) {
  return {
    id: row.id,
    date: row.date,
    poNo: row.po_no,
    poType: row.po_type,
    processLocation: row.process_location,
    partyName: row.party_name,
    partNo: row.part_no,
    productName: row.product_name,
    typeOfProcess: row.type_of_process,
    orderQty: Number(row.order_qty || 0),
    dispatchQty: Number(row.dispatch_qty || 0),
    balanceQty: Number(row.balance_qty || 0),
    deliveryDate: row.delivery_date,
    daysLeft: row.days_left,
    priority: row.priority,
    remark: row.remark,
    finalStatus: row.final_status,
    orgId: row.org_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapToDb(data, orgId, userId) {
  const payload = {
    po_no: data.poNo,
    po_type: data.poType,
    process_location: data.processLocation,
    party_name: data.partyName,
    part_no: data.partNo,
    product_name: data.productName,
    type_of_process: data.typeOfProcess,
    order_qty: Number(data.orderQty || 0),
    dispatch_qty: Number(data.dispatchQty || 0),
    delivery_date: data.deliveryDate || null,
    days_left: data.daysLeft !== undefined ? Number(data.daysLeft) : null,
    priority: data.priority,
    remark: data.remark,
    final_status: data.finalStatus,
    date: data.date || new Date().toISOString().split('T')[0],
  };
  if (orgId) payload.org_id = orgId;
  if (userId) payload.created_by = userId;
  return payload;
}
