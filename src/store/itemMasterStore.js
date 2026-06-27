import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

const DEFAULT_LOOKUPS = {
  itemCategory: ['Raw Material', 'Consumables', 'Finished Goods', 'Packaging', 'Capital Goods', 'Spares'],
  subCategory: ['Rubber', 'Chemicals', 'Metals', 'Plastic', 'Oils', 'Others'],
  uom: ['Kgs', 'Ltrs', 'Mtrs', 'Nos', 'Sets', 'Pcs', 'Bags', 'Rolls'],
};

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

  // Lookups
  lookups: {},

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
    // Fetch lookups
    const { data: lookupsData } = await supabase
      .from('app_lookups')
      .select('*')
      .eq('org_id', orgId);

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

    set(state => {
      let finalLookups = {};
      if (lookupsData && lookupsData.length > 0) {
        lookupsData.forEach(item => {
          if (!finalLookups[item.type]) {
            finalLookups[item.type] = [];
          }
          if (!finalLookups[item.type].includes(item.value)) {
            finalLookups[item.type].push(item.value);
          }
        });
      }

      // Check for missing types from DEFAULT_LOOKUPS and seed them
      const seedData = [];
      Object.entries(DEFAULT_LOOKUPS).forEach(([type, values]) => {
        // If the DB returned absolutely nothing for this type, seed the defaults
        if (!finalLookups[type]) {
          values.forEach(value => {
            seedData.push({ org_id: orgId, type, value });
          });
          finalLookups[type] = [...values];
        }
      });

      if (seedData.length > 0) {
        // Insert missing defaults in background
        supabase.from('app_lookups').insert(seedData).then(({ error }) => {
          if (error) console.error("Failed to seed lookups:", error);
        });
      }

      return { 
        items: (data || []).map(mapFromDb), 
        isLoading: false,
        lookups: finalLookups
      };
    });
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
        if (orgId) await get().fetchItems(orgId);
        get().addNotification('Item master created successfully!', 'success');
        return true;
      }
    }

    if (orgId) await get().fetchItems(orgId);
    get().addNotification('Item master created successfully!', 'success');
    return true;
  },

  updateItem: async (id, itemData, userId) => {
    const existingItem = get().items.find(i => i.id === id);
    const itemOrgId = existingItem?.orgId;

    let finalAttachments = itemData.qualityAttachments || [];
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
    if (itemOrgId) await get().fetchItems(itemOrgId);
    get().addNotification('Item master updated successfully!', 'success');
    return true;
  },

  deleteItem: async (id) => {
    const existingItem = get().items.find(i => i.id === id);
    const itemOrgId = existingItem?.orgId;
    const { error } = await supabase.from('item_master').delete().eq('id', id);
    if (error) {
      get().addNotification(`Failed to delete item: ${error.message}`, 'error');
      return false;
    }
    if (itemOrgId) await get().fetchItems(itemOrgId);
    get().addNotification('Item deleted.', 'error');
    return true;
  },

  // ── Lookup management ─────────────────────────────────────────────────
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
    else get().addNotification(`Failed to save: Item already exists or save failed`, 'error');
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
        items: state.items.map(i => (i[fieldKey] === oldValue ? { ...i, [fieldKey]: cleaned } : i)),
      };
    });
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deleteLookupOption: async (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().items.filter(i => i[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} item(s).`, 'error');
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
      lookups: {
        ...state.lookups,
        [fieldKey]: (state.lookups[fieldKey] || []).filter(o => o !== value),
      },
    }));
    get().addNotification(`"${value}" deleted`, 'error');
    return true;
  },

  // ── Filters & Selectors ─────────────────────────────────────────────────────────
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
    itemCategory: row.item_category || '',
    subCategory: row.sub_category || '',
    itemCode: row.item_code || '',
    itemName: row.item_name || '',
    description: row.description || '',
    itemPrice: Number(row.item_price || 0),
    remarks: row.remarks || '',
    itemHsn: row.item_hsn || '',
    hsnTax: Number(row.hsn_tax || 0),
    itemAlloy: row.item_alloy || '',
    isActive: row.is_active || 'Yes',
    itemPurchaseMeasurement: row.item_purchase_measurement || '',
    itemStockMeasurement: row.item_stock_measurement || '',
    convFactorRate: Number(row.conv_factor_rate || 1),
    itemWeightMeasurement: row.item_weight_measurement || '',
    itemStdWeight: Number(row.item_std_weight || 0),
    isProduct: row.is_product || 'No',
    isNeedToInspect: row.is_need_to_inspect || 'No',
    isQtyVerificationRequired: row.is_qty_verification_required || 'No',
    batchNumberApplicable: row.batch_number_applicable || 'No',
    warehouseName: row.warehouse_name || '',
    departmentName: row.department_name || '',
    moq: Number(row.moq || 0),
    leadTime: row.lead_time,
    batchQty: Number(row.batch_qty || 0),
    minimumQty: Number(row.minimum_qty || 0),
    maximumQty: Number(row.maximum_qty || 0),
    reorderLevelQty: Number(row.reorder_level_qty || 0),
    salesTolerance: Number(row.sales_tolerance || 0),
    purchaseTolerance: Number(row.purchase_tolerance || 0),
    itemPurchaseLedger: row.item_purchase_ledger || '',
    itemSaleLedger: row.item_sale_ledger || '',
    itemServiceLedger: row.item_service_ledger || '',
    className: row.class_name || '',
    haveSelfLife: row.have_self_life || 'No',
    selfLifeDays: row.self_life_days,
    autoConsumptionIssueToDept: row.auto_consumption_issue_to_dept || 'No',
    scrapItem: row.scrap_item || '',
    mrpPrice: Number(row.mrp_price || 0),
    drawingNo: row.drawing_no || '',
    revisionNo: row.revision_no || '',
    customerName: row.customer_name || '',
    partName: row.part_name || '',
    partNo: row.part_no || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachments: row.attachments || [],
    aliasName: row.alias_name || '',
    standardPacking: Number(row.standard_packing || 0),
    uom: row.uom || '',
    preferredVendor: row.preferred_vendor || '',
    alternateVendor: row.alternate_vendor || '',
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
    sub_category: data.subCategory,
    alias_name: data.aliasName,
    standard_packing: Number(data.standardPacking || 0),
    uom: data.uom,
    preferred_vendor: data.preferredVendor,
    alternate_vendor: data.alternateVendor,
  };
  if (orgId) payload.org_id = orgId;
  if (userId) payload.created_by = userId;
  return payload;
}
