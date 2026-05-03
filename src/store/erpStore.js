import { create } from 'zustand';

// Sample initial data matching the screenshot structure
const initialOrders = [
  {
    id: 1,
    date: '2024-01-15',
    poNo: 'PO2024-0015',
    poType: 'Purchase',
    partyName: 'Reliance Industries',
    partNo: 'RIL-PART-001',
    productName: 'SS-230 FILTERS FLANGE/SOCKET 120/14F-NISARG',
    domains: 'No flag',
    orderQty: 50,
    dispatchQty: 30,
    balanceQty: 20,
    manualStatus: 'Pending',
    deliveryDate: '2024-02-15',
    daysLeft: 12,
    priority: 'High',
    remark: 'Urgent delivery',
    finalStatus: 'Partial Dispatch',
  },
  {
    id: 2,
    date: '2024-01-18',
    poNo: 'PO2024-0022',
    poType: 'Production',
    partyName: 'SAHIL ALLEQUIPMENT',
    partNo: 'SA-PART-0022',
    productName: 'TRO-N NISARG 40/12 SPECIAL GRADE',
    domains: 'No flag',
    orderQty: 100,
    dispatchQty: 100,
    balanceQty: 0,
    manualStatus: 'Completed',
    deliveryDate: '2024-01-28',
    daysLeft: 0,
    priority: 'Normal',
    remark: 'Delivered on time',
    finalStatus: 'Dispatched',
  },
  {
    id: 3,
    date: '2024-01-20',
    poNo: 'PO2024-0031',
    poType: 'Purchase',
    partyName: 'TATA MOTORS LTD',
    partNo: 'TM-VALVE-031',
    productName: 'SS-250 VALVE ASSEMBLY FLANGE TYPE 200MM',
    domains: 'No flag',
    orderQty: 200,
    dispatchQty: 0,
    balanceQty: 200,
    manualStatus: 'Pending',
    deliveryDate: '2024-03-01',
    daysLeft: 25,
    priority: 'Medium',
    remark: '',
    finalStatus: 'Pending Dispatch',
  },
  {
    id: 4,
    date: '2024-01-22',
    poNo: 'PO2024-0038',
    poType: 'Production',
    partyName: 'Ambuja Cement Ltd',
    partNo: 'ACL-PUMP-038',
    productName: 'PUMP HOUSING SS-316 NISARG SPECIAL 80MM',
    domains: 'No flag',
    orderQty: 15,
    dispatchQty: 10,
    balanceQty: 5,
    manualStatus: 'In Progress',
    deliveryDate: '2024-02-10',
    daysLeft: 5,
    priority: 'High',
    remark: 'Partial dispatched',
    finalStatus: 'Partial Dispatch',
  },
  {
    id: 5,
    date: '2024-01-25',
    poNo: 'PO2024-0045',
    poType: 'Purchase',
    partyName: 'GAIL India Limited',
    partNo: 'GAIL-FLANGE-045',
    productName: 'FLANGE ORIFICE PLATE SS-304 NISARG 150MM',
    domains: 'No flag',
    orderQty: 75,
    dispatchQty: 75,
    balanceQty: 0,
    manualStatus: 'Completed',
    deliveryDate: '2024-02-05',
    daysLeft: 0,
    priority: 'Normal',
    remark: 'Completed',
    finalStatus: 'Dispatched',
  },
  {
    id: 6,
    date: '2024-01-28',
    poNo: 'PO2024-0052',
    poType: 'Production',
    partyName: 'BHEL Haridwar',
    partNo: 'BHEL-BOILER-052',
    productName: 'BOILER TUBE FITTING SS-321 NISARG 25MM',
    domains: 'No flag',
    orderQty: 500,
    dispatchQty: 200,
    balanceQty: 300,
    manualStatus: 'In Progress',
    deliveryDate: '2024-03-15',
    daysLeft: 30,
    priority: 'Low',
    remark: 'Large order',
    finalStatus: 'Partial Dispatch',
  },
  {
    id: 7,
    date: '2024-02-01',
    poNo: 'PO2024-0060',
    poType: 'Purchase',
    partyName: 'ONGC Petroleum',
    partNo: 'ONGC-VALVE-060',
    productName: 'GATE VALVE SS-316L NISARG API 600 4 INCH',
    domains: 'No flag',
    orderQty: 30,
    dispatchQty: 0,
    balanceQty: 30,
    manualStatus: 'Pending',
    deliveryDate: '2024-02-20',
    daysLeft: 3,
    priority: 'Urgent',
    remark: 'Critical project',
    finalStatus: 'Pending Dispatch',
  },
];

const initialWeeklyPlans = [
  {
    id: 1,
    partName: '300WATT JALI GASKET',
    partNo: 'PG-JALI-001',
    machineSize: '250 Ton',
    workOrderNo: 'WO-2024-089',
    cavity: 1,
    schedule: {
      monday: {
        day: { plan: 250, actual: 222, operator: 'GAUTAM' },
        night: { plan: 240, actual: 235, operator: 'RAMESH' }
      },
      tuesday: {
        day: { plan: 250, actual: 240, operator: 'GAUTAM' },
        night: { plan: 240, actual: 242, operator: 'RAMESH' }
      },
      wednesday: {
        day: { plan: 260, actual: 255, operator: 'GAUTAM' },
        night: { plan: 240, actual: 238, operator: 'RAMESH' }
      },
      thursday: {
        day: { plan: 250, actual: 248, operator: 'SANDEEP' },
        night: { plan: 240, actual: 240, operator: 'SURESH' }
      },
      friday: {
        day: { plan: 250, actual: 252, operator: 'SANDEEP' },
        night: { plan: 240, actual: 230, operator: 'SURESH' }
      },
      saturday: {
        day: { plan: 220, actual: 210, operator: 'SANDEEP' },
        night: { plan: 200, actual: 195, operator: 'SURESH' }
      }
    }
  },
  {
    id: 2,
    partName: 'CT BOOT',
    partNo: 'BT-CT-552',
    machineSize: '150 Ton',
    workOrderNo: 'WO-2024-112',
    cavity: 6,
    schedule: {
      monday: {
        day: { plan: 240, actual: 193, operator: 'SANDEEP' },
        night: { plan: 220, actual: 210, operator: 'AJAY' }
      },
      tuesday: {
        day: { plan: 240, actual: 235, operator: 'SANDEEP' },
        night: { plan: 220, actual: 215, operator: 'AJAY' }
      },
      wednesday: {
        day: { plan: 240, actual: 242, operator: 'SANDEEP' },
        night: { plan: 220, actual: 220, operator: 'AJAY' }
      },
      thursday: {
        day: { plan: 240, actual: 238, operator: 'GAUTAM' },
        night: { plan: 220, actual: 218, operator: 'RAMESH' }
      },
      friday: {
        day: { plan: 240, actual: 245, operator: 'GAUTAM' },
        night: { plan: 220, actual: 222, operator: 'RAMESH' }
      },
      saturday: {
        day: { plan: 200, actual: 190, operator: 'GAUTAM' },
        night: { plan: 180, actual: 175, operator: 'RAMESH' }
      }
    }
  }
];

let nextId = initialOrders.length + 1;
let nextWeeklyPlanId = initialWeeklyPlans.length + 1;

export const useERPStore = create((set, get) => ({
  // Data
  orders: initialOrders,
  weeklyPlans: initialWeeklyPlans,
  
  // UI State
  searchQuery: '',
  filterStatus: 'All',
  filterPriority: 'All',
  filterPoType: 'All',
  currentPage: 1,
  itemsPerPage: 10,
  sortField: 'date',
  sortDirection: 'desc',
  selectedOrders: [],
  
  // Modal State
  isModalOpen: false,
  modalMode: 'view', // 'view' | 'edit' | 'add'
  selectedOrder: null,
  isDeleteConfirmOpen: false,
  orderToDelete: null,
  
  // Weekly Plan Modal State
  isWeeklyModalOpen: false,
  weeklyModalMode: 'view',
  selectedWeeklyPlan: null,
  isWeeklyDeleteConfirmOpen: false,
  weeklyPlanToDelete: null,
  
  // Notifications
  notifications: [],

  // --- ACTIONS ---

  // Notification helper
  addNotification: (message, type = 'success') => {
    const id = Date.now();
    set(state => ({
      notifications: [...state.notifications, { id, message, type }]
    }));
    setTimeout(() => {
      set(state => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, 3000);
  },

  // CRUD Operations
  addOrder: (orderData) => {
    const newOrder = {
      ...orderData,
      id: nextId++,
      balanceQty: Number(orderData.orderQty) - Number(orderData.dispatchQty),
      date: orderData.date || new Date().toISOString().split('T')[0],
    };
    set(state => ({ orders: [newOrder, ...state.orders] }));
    get().addNotification('Purchase order created successfully!', 'success');
    get().closeModal();
  },

  updateOrder: (id, orderData) => {
    set(state => ({
      orders: state.orders.map(o =>
        o.id === id
          ? {
              ...o,
              ...orderData,
              balanceQty: Number(orderData.orderQty) - Number(orderData.dispatchQty),
            }
          : o
      ),
    }));
    get().addNotification('Order updated successfully!', 'success');
    get().closeModal();
  },

  deleteOrder: (id) => {
    set(state => ({
      orders: state.orders.filter(o => o.id !== id),
      selectedOrders: state.selectedOrders.filter(sid => sid !== id),
    }));
    get().addNotification('Order deleted successfully!', 'error');
    set({ isDeleteConfirmOpen: false, orderToDelete: null });
  },

  addWeeklyPlan: (planData) => {
    const newPlan = {
      ...planData,
      id: nextWeeklyPlanId++,
    };
    set(state => ({ weeklyPlans: [newPlan, ...state.weeklyPlans] }));
    get().addNotification('Weekly plan created successfully!', 'success');
    get().closeWeeklyModal();
  },

  updateWeeklyPlan: (id, planData) => {
    set(state => ({
      weeklyPlans: state.weeklyPlans.map(p =>
        p.id === id ? { ...p, ...planData } : p
      ),
    }));
    get().addNotification('Weekly plan updated successfully!', 'success');
    get().closeWeeklyModal();
  },

  deleteWeeklyPlan: (id) => {
    set(state => ({
      weeklyPlans: state.weeklyPlans.filter(p => p.id !== id),
    }));
    get().addNotification('Weekly plan deleted successfully!', 'error');
    set({ isWeeklyDeleteConfirmOpen: false, weeklyPlanToDelete: null });
  },

  // Weekly Modal controls
  openWeeklyModal: (mode, plan = null) => {
    set({ isWeeklyModalOpen: true, weeklyModalMode: mode, selectedWeeklyPlan: plan });
  },
  closeWeeklyModal: () => {
    set({ isWeeklyModalOpen: false, selectedWeeklyPlan: null });
  },
  openWeeklyDeleteConfirm: (plan) => {
    set({ isWeeklyDeleteConfirmOpen: true, weeklyPlanToDelete: plan });
  },
  closeWeeklyDeleteConfirm: () => {
    set({ isWeeklyDeleteConfirmOpen: false, weeklyPlanToDelete: null });
  },

  deleteSelectedOrders: () => {
    const { selectedOrders } = get();
    set(state => ({
      orders: state.orders.filter(o => !selectedOrders.includes(o.id)),
      selectedOrders: [],
    }));
    get().addNotification(`${selectedOrders.length} orders deleted!`, 'error');
  },

  // Modal controls
  openModal: (mode, order = null) => {
    set({ isModalOpen: true, modalMode: mode, selectedOrder: order });
  },
  closeModal: () => {
    set({ isModalOpen: false, selectedOrder: null });
  },
  openDeleteConfirm: (order) => {
    set({ isDeleteConfirmOpen: true, orderToDelete: order });
  },
  closeDeleteConfirm: () => {
    set({ isDeleteConfirmOpen: false, orderToDelete: null });
  },

  // Selection
  toggleSelectOrder: (id) => {
    set(state => ({
      selectedOrders: state.selectedOrders.includes(id)
        ? state.selectedOrders.filter(sid => sid !== id)
        : [...state.selectedOrders, id],
    }));
  },
  toggleSelectAll: (visibleIds) => {
    const { selectedOrders } = get();
    const allSelected = visibleIds.every(id => selectedOrders.includes(id));
    set({
      selectedOrders: allSelected ? [] : visibleIds,
    });
  },
  clearSelection: () => set({ selectedOrders: [] }),

  // Filters & Search
  setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),
  setFilterStatus: (s) => set({ filterStatus: s, currentPage: 1 }),
  setFilterPriority: (p) => set({ filterPriority: p, currentPage: 1 }),
  setFilterPoType: (t) => set({ filterPoType: t, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),
  setSortField: (field) => {
    set(state => ({
      sortField: field,
      sortDirection: state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc',
    }));
  },

  // Computed selectors (getters)
  getFilteredOrders: () => {
    const { orders, searchQuery, filterStatus, filterPriority, filterPoType, sortField, sortDirection } = get();

    let filtered = orders.filter(o => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        o.poNo.toLowerCase().includes(q) ||
        o.partyName.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.partNo.toLowerCase().includes(q);
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
      totalOrderQty: orders.reduce((s, o) => s + Number(o.orderQty), 0),
      totalDispatchQty: orders.reduce((s, o) => s + Number(o.dispatchQty), 0),
    };
  },
}));
