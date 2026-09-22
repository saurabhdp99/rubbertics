import { create } from 'zustand';
import { DEFAULT_BOM, calculateGrossWeight, calculateBOMCost } from '../data/bomTemplate';
import { supabase } from '../lib/supabase';

const STORAGE_KEY = 'rubbertics_boms_data';

const DUMMY_BOM_IDS = new Set(['bom-001', 'bom-002', 'bom-003', 'bom-004']);
const DUMMY_BOM_NOS = new Set(['BOM-26-001', 'BOM-26-002', 'BOM-26-003', 'BOM-26-004']);

function isDummyBOM(b) {
  if (!b) return false;
  if (DUMMY_BOM_IDS.has(b.id) || DUMMY_BOM_NOS.has(b.bomNo)) return true;
  if (typeof b.id === 'string' && (b.id.startsWith('bom-001') || b.id.startsWith('bom-002') || b.id.startsWith('bom-003') || b.id.startsWith('bom-004'))) return true;
  return false;
}

// Load stored BOMs from localStorage or return empty list
function loadInitialBOMs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = parsed.filter(b => !isDummyBOM(b));
        if (cleaned.length !== parsed.length) {
          saveBOMs(cleaned);
        }
        return cleaned;
      }
    }
  } catch (err) {
    console.error('Error loading BOMs from storage:', err);
  }
  return [];
}

function saveBOMs(boms) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boms));
  } catch (err) {
    console.error('Error saving BOMs to storage:', err);
  }
}

// Helper: Upload BOM images to Supabase Storage 'attachments'
async function uploadBOMImages(images, orgId, bomId) {
  if (!images || !Array.isArray(images) || images.length === 0) return [];
  return await Promise.all(images.map(async (img) => {
    if (img.fileObject) {
      try {
        const cleanName = (img.fileName || img.fileObject.name || 'image.jpg').replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${Date.now()}_${cleanName}`;
        const filePath = `${orgId || 'common'}/bill_of_materials/${bomId}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, img.fileObject, {
          contentType: img.fileObject.type || 'image/jpeg',
          upsert: true,
        });
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
          return {
            id: img.id || crypto.randomUUID(),
            title: img.title || img.name || img.fileName || 'Product Image',
            name: img.title || img.name || img.fileName || 'Product Image',
            fileName: img.fileName || img.fileObject.name,
            fileType: img.fileType || img.fileObject.type,
            url: publicUrl,
            fileData: publicUrl,
          };
        } else {
          console.error('Supabase storage upload error:', uploadError);
        }
      } catch (uploadErr) {
        console.error('Error during image upload:', uploadErr);
      }
    }
    // Return existing image object with url/fileData preserved
    return {
      id: img.id || crypto.randomUUID(),
      title: img.title || img.name || img.fileName || 'Product Image',
      name: img.title || img.name || img.fileName || 'Product Image',
      fileName: img.fileName || '',
      fileType: img.fileType || '',
      url: img.url || img.fileData || '',
      fileData: img.url || img.fileData || '',
    };
  }));
}

// Map database row to store BOM model
function mapFromDb(row) {
  return {
    id: row.id,
    orgId: row.org_id,
    bomNo: row.bom_no,
    bomTitle: row.bom_title,
    status: row.status || 'Draft',
    itemCode: row.item_code || '',
    itemName: row.item_name || '',
    customerPartNo: row.customer_part_no || '',
    drawingNo: row.drawing_no || '',
    revisionNo: row.revision_no || '',
    effectiveDate: row.effective_date || '',
    outputUom: row.output_uom || 'Pcs',
    batchQty: row.batch_qty !== null ? Number(row.batch_qty) : 100,
    mouldCode: row.mould_code || '',
    cavities: row.cavities !== null ? Number(row.cavities) : 1,
    cycleTimeSec: row.cycle_time_sec !== null ? Number(row.cycle_time_sec) : 180,
    toolItemNetWeight: row.tool_item_net_weight ? String(row.tool_item_net_weight) : '',
    toolSortWeight: row.tool_sort_weight ? String(row.tool_sort_weight) : '',
    machinePress: row.machine_press || '',
    compoundCode: row.compound_code || '',
    compoundName: row.compound_name || '',
    polymer: row.polymer || '',
    colour: row.colour || '',
    hardness: row.hardness || '',
    specificGravity: row.specific_gravity || '',
    netCompoundWeight: row.net_compound_weight ?? row.net_weight ?? '',
    netWeight: row.net_weight ?? row.net_compound_weight ?? '',
    weightLossFlyLossPercent: row.weight_loss_fly_loss_percent ?? row.scrap_percent ?? '',
    scrapPercent: row.scrap_percent ?? row.weight_loss_fly_loss_percent ?? '',
    grossWeight: row.gross_weight ?? '',
    compoundRate: row.compound_rate ?? '',
    inserts: Array.isArray(row.inserts) ? row.inserts : [],
    packaging: Array.isArray(row.packaging) ? row.packaging : [],
    routing: Array.isArray(row.routing) && row.routing.length > 0 ? row.routing : [...DEFAULT_BOM.routing],
    images: Array.isArray(row.images) ? row.images : [],
    overheadCost: row.overhead_cost ?? 0,
    remarks: row.remarks || '',
    prepared_by: row.prepared_by || '',
    checked_by: row.checked_by || '',
    approved_by: row.approved_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

// Map store BOM model to database row
function mapToDb(data, orgId, userId) {
  const payload = {
    bom_no: data.bomNo,
    bom_title: data.bomTitle,
    status: data.status || 'Draft',
    item_code: data.itemCode || null,
    item_name: data.itemName,
    customer_part_no: data.customerPartNo || null,
    drawing_no: data.drawingNo || null,
    revision_no: data.revisionNo || null,
    effective_date: data.effectiveDate || null,
    output_uom: data.outputUom || 'Pcs',
    batch_qty: data.batchQty ? Number(data.batchQty) : 100,
    mould_code: data.mouldCode || null,
    cavities: data.cavities ? parseInt(data.cavities, 10) : 1,
    cycle_time_sec: data.cycleTimeSec ? parseFloat(data.cycleTimeSec) : 180,
    tool_item_net_weight: data.toolItemNetWeight ? parseFloat(data.toolItemNetWeight) : null,
    tool_sort_weight: data.toolSortWeight ? parseFloat(data.toolSortWeight) : null,
    machine_press: data.machinePress || null,
    compound_code: data.compoundCode || null,
    compound_name: data.compoundName || null,
    polymer: data.polymer || null,
    colour: data.colour || null,
    hardness: data.hardness || null,
    specific_gravity: data.specificGravity || null,
    net_compound_weight: parseFloat(data.netCompoundWeight ?? data.netWeight) || 0,
    net_weight: parseFloat(data.netCompoundWeight ?? data.netWeight) || 0,
    weight_loss_fly_loss_percent: parseFloat(data.weightLossFlyLossPercent ?? data.scrapPercent) || 0,
    scrap_percent: parseFloat(data.weightLossFlyLossPercent ?? data.scrapPercent) || 0,
    gross_weight: parseFloat(data.grossWeight) || 0,
    compound_rate: parseFloat(data.compoundRate) || 0,
    inserts: data.inserts || [],
    packaging: data.packaging || [],
    routing: data.routing || [],
    images: data.images || [],
    overhead_cost: parseFloat(data.overheadCost) || 0,
    remarks: data.remarks || null,
    prepared_by: data.prepared_by || null,
    checked_by: data.checked_by || null,
    approved_by: data.approved_by || null,
    updated_at: new Date().toISOString(),
  };
  if (orgId) payload.org_id = orgId;
  if (userId) {
    if (!data.id) payload.created_by = userId;
    payload.updated_by = userId;
  }
  return payload;
}

export const useBOMStore = create((set, get) => ({
  boms: loadInitialBOMs(),
  isLoading: false,
  selectedBOM: null,

  // Modals state
  isModalOpen: false,
  modalMode: 'create', // 'create' | 'edit' | 'duplicate'
  isDetailModalOpen: false,

  // Search & Filter state
  searchQuery: '',
  statusFilter: 'All', // 'All' | 'Active' | 'Draft' | 'Under Review' | 'Obsolete'
  polymerFilter: 'All',

  // Notifications
  notifications: [],
  addNotification: (message, type = 'success') => {
    const id = Date.now();
    set(state => ({ notifications: [...state.notifications, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ notifications: state.notifications.filter(n => n.id !== id) }));
    }, 3000);
  },

  // State setters
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setPolymerFilter: (polymer) => set({ polymerFilter: polymer }),
  
  setModalOpen: (isOpen, mode = 'create', bom = null) => {
    set({
      isModalOpen: isOpen,
      modalMode: mode,
      selectedBOM: bom ? { ...bom } : null
    });
  },

  setDetailModalOpen: (isOpen, bom = null) => {
    set({
      isDetailModalOpen: isOpen,
      selectedBOM: bom ? { ...bom } : null
    });
  },

  // Supabase Fetch
  fetchBOMs: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('bill_of_materials')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped = data.map(mapFromDb).filter(b => !isDummyBOM(b));
        saveBOMs(mapped);
        set({ boms: mapped, isLoading: false });
        return;
      }
    } catch (err) {
      console.error('Error fetching BOMs from Supabase:', err);
    }
    set({ isLoading: false });
  },

  // CRUD Actions
  addBOM: async (bomData, orgId, userId) => {
    const boms = get().boms;
    const yearCode = String(new Date().getFullYear()).slice(-2);
    const prefix = `BOM-${yearCode}-`;
    let maxNum = 0;
    boms.forEach(b => {
      if (b.bomNo && typeof b.bomNo === 'string' && b.bomNo.startsWith(prefix)) {
        const num = parseInt(b.bomNo.replace(prefix, ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const count = maxNum > 0 ? maxNum + 1 : boms.length + 1;
    const autoBomNo = bomData.bomNo?.trim() || `${prefix}${String(count).padStart(3, '0')}`;
    const newId = crypto.randomUUID ? crypto.randomUUID() : `bom-${Date.now()}`;

    // Upload any newly selected images to Supabase storage
    const uploadedImages = await uploadBOMImages(bomData.images, orgId, newId);

    const net = bomData.netCompoundWeight !== undefined && bomData.netCompoundWeight !== null && bomData.netCompoundWeight !== ''
      ? bomData.netCompoundWeight
      : bomData.netWeight;
    const lossPercent = bomData.weightLossFlyLossPercent !== undefined && bomData.weightLossFlyLossPercent !== null
      ? bomData.weightLossFlyLossPercent
      : bomData.scrapPercent;
    const gross = bomData.grossWeight || calculateGrossWeight(net, lossPercent);

    const newBOM = {
      ...DEFAULT_BOM,
      ...bomData,
      id: newId,
      orgId: orgId || null,
      bomNo: autoBomNo,
      netCompoundWeight: parseFloat(net) || 0,
      netWeight: parseFloat(net) || 0,
      weightLossFlyLossPercent: parseFloat(lossPercent) || 0,
      scrapPercent: parseFloat(lossPercent) || 0,
      grossWeight: gross,
      images: uploadedImages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Supabase
    if (orgId) {
      try {
        const payload = mapToDb(newBOM, orgId, userId);
        payload.id = newId;
        const { error: dbError } = await supabase.from('bill_of_materials').insert([payload]);
        if (dbError) {
          console.error('Error inserting BOM into Supabase:', dbError);
        }
      } catch (err) {
        console.error('Failed to sync new BOM with Supabase:', err);
      }
    }

    const updated = [newBOM, ...boms];
    saveBOMs(updated);
    set({ boms: updated, isModalOpen: false });
    get().addNotification(`BOM ${newBOM.bomNo} created successfully`);
    return newBOM;
  },

  updateBOM: async (id, updates, orgId, userId) => {
    const boms = get().boms;
    const existing = boms.find(b => b.id === id);
    const resolvedOrgId = orgId || existing?.orgId;

    // Upload any newly selected images to Supabase storage
    const uploadedImages = updates.images
      ? await uploadBOMImages(updates.images, resolvedOrgId, id)
      : (existing?.images || []);

    const updated = boms.map(b => {
      if (b.id === id) {
        const net = updates.netCompoundWeight !== undefined && updates.netCompoundWeight !== null && updates.netCompoundWeight !== ''
          ? updates.netCompoundWeight
          : (updates.netWeight !== undefined && updates.netWeight !== null && updates.netWeight !== ''
            ? updates.netWeight
            : (b.netCompoundWeight ?? b.netWeight));
        const lossPercent = updates.weightLossFlyLossPercent !== undefined && updates.weightLossFlyLossPercent !== null
          ? updates.weightLossFlyLossPercent
          : (updates.scrapPercent !== undefined && updates.scrapPercent !== null
            ? updates.scrapPercent
            : (b.weightLossFlyLossPercent ?? b.scrapPercent));
        const gross = updates.grossWeight || calculateGrossWeight(net, lossPercent);
        return {
          ...b,
          ...updates,
          netCompoundWeight: parseFloat(net) || 0,
          netWeight: parseFloat(net) || 0,
          weightLossFlyLossPercent: parseFloat(lossPercent) || 0,
          scrapPercent: parseFloat(lossPercent) || 0,
          grossWeight: gross,
          images: uploadedImages,
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    });

    // Save to Supabase
    if (resolvedOrgId) {
      try {
        const updatedBom = updated.find(b => b.id === id);
        if (updatedBom) {
          const payload = mapToDb(updatedBom, resolvedOrgId, userId);
          const { error: dbError } = await supabase.from('bill_of_materials').update(payload).eq('id', id);
          if (dbError) {
            console.error('Error updating BOM in Supabase:', dbError);
          }
        }
      } catch (err) {
        console.error('Failed to sync updated BOM with Supabase:', err);
      }
    }

    saveBOMs(updated);
    set({ boms: updated, isModalOpen: false, selectedBOM: null });
    get().addNotification(`BOM updated successfully`);
  },

  deleteBOM: async (id, orgId) => {
    const boms = get().boms;
    const toDelete = boms.find(b => b.id === id);
    const resolvedOrgId = orgId || toDelete?.orgId;

    if (resolvedOrgId) {
      try {
        await supabase.from('bill_of_materials').delete().eq('id', id);
      } catch (err) {
        console.error('Error deleting BOM from Supabase:', err);
      }
    }

    const updated = boms.filter(b => b.id !== id);
    saveBOMs(updated);
    set({ boms: updated, isDetailModalOpen: false });
    get().addNotification(`BOM ${toDelete?.bomNo || ''} deleted`, 'info');
  },

  duplicateBOM: (id) => {
    const boms = get().boms;
    const original = boms.find(b => b.id === id);
    if (!original) return;

    // Parse current revision and increment
    let newRev = 'Rev 2.0';
    if (original.revisionNo) {
      const match = original.revisionNo.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        const num = parseFloat(match[1]);
        newRev = `Rev ${(num + 1).toFixed(1)}`;
      }
    }

    const yearCode = String(new Date().getFullYear()).slice(-2);
    const prefix = `BOM-${yearCode}-`;
    let maxNum = 0;
    boms.forEach(b => {
      if (b.bomNo && typeof b.bomNo === 'string' && b.bomNo.startsWith(prefix)) {
        const num = parseInt(b.bomNo.replace(prefix, ''), 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    });
    const count = maxNum > 0 ? maxNum + 1 : boms.length + 1;
    const newBomNo = `${prefix}${String(count).padStart(3, '0')}`;

    const duplicated = {
      ...original,
      id: crypto.randomUUID ? crypto.randomUUID() : `bom-${Date.now()}`,
      bomNo: newBomNo,
      bomTitle: `${original.bomTitle} (${newRev})`,
      revisionNo: newRev,
      status: 'Draft',
      effectiveDate: new Date().toISOString().split('T')[0],
      images: original.images ? [...original.images] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    set({
      isModalOpen: true,
      modalMode: 'duplicate',
      selectedBOM: duplicated
    });
    get().addNotification(`Drafting new revision ${newRev} from ${original.bomNo}`);
  },

  toggleStatus: async (id, newStatus, orgId) => {
    const boms = get().boms;
    const updated = boms.map(b => b.id === id ? { ...b, status: newStatus, updatedAt: new Date().toISOString() } : b);
    saveBOMs(updated);
    set({ boms: updated });

    if (orgId) {
      try {
        await supabase.from('bill_of_materials').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
      } catch (err) {
        console.error('Error updating status in Supabase:', err);
      }
    }

    get().addNotification(`BOM status updated to ${newStatus}`);
  },

  resetToSampleData: () => {
    saveBOMs([]);
    set({ boms: [] });
    get().addNotification('All BOM records cleared');
  },

  exportToCSV: () => {
    const boms = get().boms;
    if (boms.length === 0) {
      get().addNotification('No BOM records to export', 'error');
      return;
    }

    const headers = [
      'BOM No', 'Title', 'Item Code', 'Item Name', 'Customer Part No', 'Drawing No',
      'Revision', 'Status', 'Polymer', 'Compound Code', 'Colour', 'Hardness',
      'Net Compound Wt (kg)', 'Weight Loss / Fly Loss %', 'Gross Wt (kg)', 'Compound Rate', 'Mould Code', 'Cavities',
      'Cycle Time (s)', 'Est Unit Cost', 'Batch Qty', 'Images Count'
    ];

    const rows = boms.map(b => {
      const costs = calculateBOMCost(b);
      return [
        `"${b.bomNo}"`,
        `"${b.bomTitle || ''}"`,
        `"${b.itemCode || ''}"`,
        `"${b.itemName || ''}"`,
        `"${b.customerPartNo || ''}"`,
        `"${b.drawingNo || ''}"`,
        `"${b.revisionNo || ''}"`,
        `"${b.status || ''}"`,
        `"${b.polymer || ''}"`,
        `"${b.compoundCode || ''}"`,
        `"${b.colour || ''}"`,
        `"${b.hardness || ''}"`,
        b.netCompoundWeight ?? b.netWeight ?? 0,
        b.weightLossFlyLossPercent ?? b.scrapPercent ?? 0,
        b.grossWeight || 0,
        b.compoundRate || 0,
        `"${b.mouldCode || ''}"`,
        b.cavities || 1,
        b.cycleTimeSec || 0,
        costs.totalUnitCost,
        b.batchQty || 100,
        (b.images || []).length
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rubbertics_BOM_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    get().addNotification('Exported Bill of Materials to CSV successfully');
  }
}));
