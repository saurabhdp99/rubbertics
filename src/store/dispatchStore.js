import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';
import { getNextInvoiceNo, getNextSrNo } from '../data/dispatchTemplate';

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapFromDb(row) {
  return {
    id: row.id,
    orgId: row.org_id,
    srNo: row.sr_no,
    invDate: row.inv_date,
    invoiceNo: row.invoice_no,
    saleOrderNo: row.sale_order_no,
    partyName: row.party_name,
    partNo: row.part_no,
    materialDescription: row.material_description,
    quantity: Number(row.quantity || 0),
    transport: row.transport,
    vehicleNo: row.vehicle_no,
    lrNo: row.lr_no,
    lrDate: row.lr_date,
    noOfBags: row.no_of_bags,
    dispatchStatus: row.dispatch_status,
    driverName: row.driver_name,
    driverPhone: row.driver_phone,
    remarks: row.remarks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapToDb(data, orgId, userId) {
  const payload = {
    org_id: orgId,
    sr_no: data.srNo ? Number(data.srNo) : null,
    inv_date: data.invDate || null,
    invoice_no: data.invoiceNo?.trim() || null,
    sale_order_no: data.saleOrderNo || null,
    party_name: data.partyName || null,
    part_no: data.partNo || null,
    material_description: data.materialDescription || null,
    quantity: Number(data.quantity || 0),
    transport: data.transport || null,
    vehicle_no: data.vehicleNo || null,
    lr_no: data.lrNo || null,
    lr_date: data.lrDate || null,
    no_of_bags: data.noOfBags || null,
    dispatch_status: data.dispatchStatus || 'Dispatched',
    driver_name: data.driverName || null,
    driver_phone: data.driverPhone || null,
    remarks: data.remarks || null,
    updated_at: new Date().toISOString(),
  };
  if (userId) payload.created_by = userId;
  return payload;
}

export const useDispatchStore = create((set, get) => ({
  dispatches: [],
  isLoading: false,
  error: null,

  selectedDispatch: null,
  isFormOpen: false,
  formMode: 'add', // 'add' | 'edit' | 'view'
  isDeleteConfirmOpen: false,
  dispatchToDelete: null,
  notifications: [],

  addNotification: (message, type = 'success') => {
    const id = Date.now();
    set((state) => ({ notifications: [...state.notifications, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }));
    }, 3200);
  },

  // ── Fetch ──────────────────────────────────────────────────────────────────
  fetchDispatches: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });

    const { data, error } = await supabase
      .from('dispatch_entries')
      .select('*')
      .eq('org_id', orgId)
      .order('sr_no', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load dispatch entries.', 'error');
      return;
    }

    set({ dispatches: (data || []).map(mapFromDb), isLoading: false });
  },

  // ── Add ────────────────────────────────────────────────────────────────────
  addDispatch: async (entryData) => {
    const orgId = useAuthStore.getState().currentOrg?.id;
    const userId = useAuthStore.getState().user?.id;
    if (!orgId) {
      get().addNotification('No organisation selected.', 'error');
      return false;
    }

    const current = get().dispatches;
    const srNo = entryData.srNo ? Number(entryData.srNo) : getNextSrNo(current);
    const invoiceNo = entryData.invoiceNo?.trim() || getNextInvoiceNo(current);

    const payload = mapToDb({ ...entryData, srNo, invoiceNo }, orgId, userId);

    const { data, error } = await supabase
      .from('dispatch_entries')
      .insert([payload])
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to create dispatch: ${error.message}`, 'error');
      return false;
    }

    set((state) => ({
      dispatches: [mapFromDb(data), ...state.dispatches],
      isFormOpen: false,
      selectedDispatch: null,
    }));
    get().addNotification(`Dispatch ${invoiceNo} created successfully!`, 'success');
    return true;
  },

  // ── Update ─────────────────────────────────────────────────────────────────
  updateDispatch: async (id, updates) => {
    const userId = useAuthStore.getState().user?.id;
    const existing = get().dispatches.find((d) => d.id === id);
    const orgId = existing?.orgId || useAuthStore.getState().currentOrg?.id;

    const payload = mapToDb(updates, orgId, userId);
    // Don't overwrite created_by on update
    delete payload.created_by;

    const { data, error } = await supabase
      .from('dispatch_entries')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to update dispatch: ${error.message}`, 'error');
      return false;
    }

    set((state) => ({
      dispatches: state.dispatches.map((d) => (d.id === id ? mapFromDb(data) : d)),
      isFormOpen: false,
      selectedDispatch: null,
    }));
    get().addNotification('Dispatch entry updated successfully!', 'success');
    return true;
  },

  // ── Delete ─────────────────────────────────────────────────────────────────
  deleteDispatch: async (id) => {
    const item = get().dispatches.find((d) => d.id === id);
    const { error } = await supabase.from('dispatch_entries').delete().eq('id', id);

    if (error) {
      get().addNotification(`Failed to delete dispatch: ${error.message}`, 'error');
      return false;
    }

    set((state) => ({
      dispatches: state.dispatches.filter((d) => d.id !== id),
      isDeleteConfirmOpen: false,
      dispatchToDelete: null,
      selectedDispatch: null,
    }));
    get().addNotification(
      `Dispatch entry ${item?.invoiceNo || ''} deleted successfully.`,
      'info'
    );
    return true;
  },

  // ── UI Actions ─────────────────────────────────────────────────────────────
  openForm: (mode = 'add', dispatch = null) => {
    set({ formMode: mode, selectedDispatch: dispatch, isFormOpen: true });
  },

  closeForm: () => {
    set({ isFormOpen: false, selectedDispatch: null });
  },

  setDeleteConfirmOpen: (isOpen, dispatch = null) => {
    set({ isDeleteConfirmOpen: isOpen, dispatchToDelete: dispatch });
  },
}));
