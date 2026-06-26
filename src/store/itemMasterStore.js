import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useItemMasterStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  items: [],
  isLoading: false,
  error: null,

  // UI / filter state
  searchQuery: '',
  categoryFilter: 'All',
  statusFilter: 'All',
  currentPage: 1,
  itemsPerPage: 10,

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

  fetchItems: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from('item_master')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load item master.', 'error');
      return;
    }
    set({ items: (data || []).map(mapFromDb), isLoading: false });
  },

  addItem: async (itemData, orgId, userId) => {
    // Insert without attachments first to get the ID
    const payload = { ...mapToDb(itemData), org_id: orgId, created_by: userId, attachments: [] };
    const { data: insertedData, error: insertError } = await supabase
      .from('item_master')
      .insert([payload])
      .select()
      .single();

    if (insertError) {
      get().addNotification(`Failed to create item: ${insertError.message}`, 'error');
      return false;
    }

    let finalAttachments = [];
    if (itemData.attachments && itemData.attachments.length > 0) {
      finalAttachments = await Promise.all(itemData.attachments.map(async (att) => {
        if (att.fileObject) {
          const fileName = `${Date.now()}_${att.fileObject.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `${orgId}/item_master/${insertedData.id}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, att.fileObject);
          if (uploadError) return att;
          const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
          return { id: att.id, name: att.name, fileName: att.fileObject.name, fileType: att.fileObject.type, fileData: publicUrl, url: publicUrl };
        }
        return att;
      }));

      const { data: updatedData, error: updateError } = await supabase
        .from('item_master')
        .update({ attachments: finalAttachments })
        .eq('id', insertedData.id)
        .select()
        .single();

      if (!updateError) {
        set(state => ({ items: [mapFromDb(updatedData), ...state.items], currentPage: 1 }));
        get().addNotification('Item master created successfully!', 'success');
        return true;
      }
    }

    set(state => ({ items: [mapFromDb(insertedData), ...state.items], currentPage: 1 }));
    get().addNotification('Item master created successfully!', 'success');
    return true;
  },

  updateItem: async (id, itemData, userId) => {
    const existingItem = get().items.find(i => i.id === id);
    const itemOrgId = existingItem?.orgId;

    let finalAttachments = itemData.attachments || [];
    if (itemOrgId && finalAttachments.length > 0) {
      finalAttachments = await Promise.all(finalAttachments.map(async (att) => {
        if (att.fileObject) {
          const fileName = `${Date.now()}_${att.fileObject.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `${itemOrgId}/item_master/${id}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, att.fileObject);
          if (uploadError) return att;
          const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
          return { id: att.id, name: att.name, fileName: att.fileObject.name, fileType: att.fileObject.type, fileData: publicUrl, url: publicUrl };
        }
        return att;
      }));
    }

    const payload = { ...mapToDb({ ...itemData, attachments: finalAttachments }), updated_by: userId };
    const { data, error } = await supabase
      .from('item_master')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to update item: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ items: state.items.map(i => (i.id === id ? mapFromDb(data) : i)) }));
    get().addNotification('Item master updated successfully!', 'success');
    return true;
  },

  deleteItem: async (id) => {
    const { error } = await supabase.from('item_master').delete().eq('id', id);
    if (error) {
      get().addNotification(`Failed to delete item: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ items: state.items.filter(i => i.id !== id) }));
    get().addNotification('Item master deleted.', 'error');
    return true;
  },

  // ── UI Actions ─────────────────────────────────────────────────────────
  setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),
  setCategoryFilter: (c) => set({ categoryFilter: c, currentPage: 1 }),
  setStatusFilter: (s) => set({ statusFilter: s, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),

  // ── Computed selectors ─────────────────────────────────────────────────
  getFilteredItems: () => {
    const { items, searchQuery, categoryFilter, statusFilter } = get();
    const q = searchQuery.toLowerCase().trim();
    return items.filter(item => {
      const matchSearch = !q || Object.values(item).some(v => String(v || '').toLowerCase().includes(q));
      const matchCat = categoryFilter === 'All' || item.itemCategory === categoryFilter;
      const matchStatus = statusFilter === 'All' || item.isActive === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  },

  getStats: () => {
    const { items } = get();
    const categories = new Set(items.map(i => i.itemCategory).filter(Boolean));
    return {
      total: items.length,
      active: items.filter(i => i.isActive === 'Yes').length,
      products: items.filter(i => i.isProduct === 'Yes').length,
      categories: categories.size,
      avgPrice: items.length
        ? items.reduce((s, i) => s + Number(i.itemPrice || 0), 0) / items.length
        : 0,
    };
  },
}));

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapFromDb(row) {
  return {
    id: row.id,
    orgId: row.org_id,
    itemCategory: row.item_category,
    itemCode: row.item_code,
    itemName: row.item_name,
    description: row.description,
    itemPrice: Number(row.item_price || 0),
    remarks: row.remarks,
    itemHsn: row.item_hsn,
    hsnTax: Number(row.hsn_tax || 0),
    itemAlloy: row.item_alloy,
    isActive: row.is_active,
    itemPurchaseMeasurement: row.item_purchase_measurement,
    itemStockMeasurement: row.item_stock_measurement,
    convFactorRate: Number(row.conv_factor_rate || 1),
    itemWeightMeasurement: row.item_weight_measurement,
    itemStdWeight: Number(row.item_std_weight || 0),
    isProduct: row.is_product,
    isNeedToInspect: row.is_need_to_inspect,
    isQtyVerificationRequired: row.is_qty_verification_required,
    batchNumberApplicable: row.batch_number_applicable,
    warehouseName: row.warehouse_name,
    departmentName: row.department_name,
    moq: Number(row.moq || 0),
    leadTime: row.lead_time,
    batchQty: Number(row.batch_qty || 0),
    minimumQty: Number(row.minimum_qty || 0),
    maximumQty: Number(row.maximum_qty || 0),
    reorderLevelQty: Number(row.reorder_level_qty || 0),
    salesTolerance: Number(row.sales_tolerance || 0),
    purchaseTolerance: Number(row.purchase_tolerance || 0),
    itemPurchaseLedger: row.item_purchase_ledger,
    itemSaleLedger: row.item_sale_ledger,
    itemServiceLedger: row.item_service_ledger,
    className: row.class_name,
    haveSelfLife: row.have_self_life,
    selfLifeDays: row.self_life_days,
    autoConsumptionIssueToDept: row.auto_consumption_issue_to_dept,
    scrapItem: row.scrap_item,
    mrpPrice: Number(row.mrp_price || 0),
    drawingNo: row.drawing_no,
    revisionNo: row.revision_no,
    customerName: row.customer_name,
    partName: row.part_name,
    partNo: row.part_no,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachments: row.attachments || [],
  };
}

function mapToDb(data, orgId, userId) {
  const payload = {
    item_category: data.itemCategory,
    item_code: data.itemCode,
    item_name: data.itemName,
    description: data.description,
    item_price: Number(data.itemPrice || 0),
    remarks: data.remarks,
    item_hsn: data.itemHsn,
    hsn_tax: Number(data.hsnTax || 0),
    item_alloy: data.itemAlloy,
    is_active: data.isActive || 'Yes',
    item_purchase_measurement: data.itemPurchaseMeasurement,
    item_stock_measurement: data.itemStockMeasurement,
    conv_factor_rate: Number(data.convFactorRate || 1),
    item_weight_measurement: data.itemWeightMeasurement,
    item_std_weight: Number(data.itemStdWeight || 0),
    is_product: data.isProduct || 'No',
    is_need_to_inspect: data.isNeedToInspect || 'No',
    is_qty_verification_required: data.isQtyVerificationRequired || 'No',
    batch_number_applicable: data.batchNumberApplicable || 'No',
    warehouse_name: data.warehouseName,
    department_name: data.departmentName,
    moq: Number(data.moq || 0),
    lead_time: Number(data.leadTime || 0),
    batch_qty: Number(data.batchQty || 0),
    minimum_qty: Number(data.minimumQty || 0),
    maximum_qty: Number(data.maximumQty || 0),
    reorder_level_qty: Number(data.reorderLevelQty || 0),
    sales_tolerance: Number(data.salesTolerance || 0),
    purchase_tolerance: Number(data.purchaseTolerance || 0),
    item_purchase_ledger: data.itemPurchaseLedger,
    item_sale_ledger: data.itemSaleLedger,
    item_service_ledger: data.itemServiceLedger,
    class_name: data.className,
    have_self_life: data.haveSelfLife || 'No',
    self_life_days: Number(data.selfLifeDays || 0),
    auto_consumption_issue_to_dept: data.autoConsumptionIssueToDept || 'No',
    scrap_item: data.scrapItem,
    mrp_price: Number(data.mrpPrice || 0),
    drawing_no: data.drawingNo,
    revision_no: data.revisionNo,
    customer_name: data.customerName,
    part_name: data.partName,
    part_no: data.partNo,
    attachments: data.attachments || [],
  };
  if (orgId) payload.org_id = orgId;
  if (userId) payload.created_by = userId;
  return payload;
}
