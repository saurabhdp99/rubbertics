import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

const DEFAULT_LOOKUPS = {
  process: [
    'Compression Moulding',
    'Injection Moulding',
    'Transfer Moulding',
    'Extrusion',
    'Trimming Die',
    'Deflashing Mold',
  ],
  toolMaterial: [
    'P20 Steel',
    'H13 Tool Steel',
    'EN8 Steel',
    'EN31 Steel',
    'D2 Steel',
    'Mild Steel (MS)',
    'Aluminum 7075',
    'Beryllium Copper',
  ],
  moldType: [
    'Two-Plate Mold',
    'Three-Plate Mold',
    'Hot Runner',
    'Cold Runner',
    'Compression Mold',
    'Transfer Mold',
    'Multi-Cavity Mold',
  ],
  maintenanceFrequency: [
    'Every 10,000 Shots',
    'Every 25,000 Shots',
    'Every 50,000 Shots',
    'Every 100,000 Shots',
    'Monthly',
    'Quarterly',
    'Half-Yearly',
    'Yearly',
  ],
};

export const useToolsMasterStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  tools: [],
  isLoading: false,
  error: null,

  searchQuery: '',
  processFilter: 'All',
  statusFilter: 'All',
  currentPage: 1,
  itemsPerPage: 10,

  lookups: {},

  notifications: [],

  addNotification: (message, type = 'success') => {
    const id = Date.now();
    set(state => ({ notifications: [...state.notifications, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ notifications: state.notifications.filter(n => n.id !== id) }));
    }, 3000);
  },

  // ── Supabase CRUD ──────────────────────────────────────────────────────

  fetchTools: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });

    // Fetch lookups
    const { data: lookupsData } = await supabase
      .from('app_lookups')
      .select('*')
      .eq('org_id', orgId);

    const { data, error } = await supabase
      .from('tool_master')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load tools master.', 'error');
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
        if (!finalLookups[type]) {
          values.forEach(value => {
            seedData.push({ org_id: orgId, type, value });
          });
          finalLookups[type] = [...values];
        }
      });

      if (seedData.length > 0) {
        supabase.from('app_lookups').insert(seedData).then(({ error }) => {
          if (error) console.error("Failed to seed lookups:", error);
        });
      }

      return { 
        tools: (data || []).map(mapFromDb), 
        isLoading: false,
        lookups: finalLookups
      };
    });
  },

  addTool: async (toolData, orgId, userId) => {
    const payload = { ...mapToDb(toolData, orgId, userId), attachments: [] };
    const { data: insertedData, error: insertError } = await supabase
      .from('tool_master')
      .insert([payload])
      .select()
      .single();

    if (insertError) {
      get().addNotification(`Failed to create tool: ${insertError.message}`, 'error');
      return false;
    }

    let finalAttachments = [];
    if (toolData.attachments && toolData.attachments.length > 0) {
      finalAttachments = await Promise.all(toolData.attachments.map(async (att) => {
        if (att.fileObject) {
          const fileName = `${Date.now()}_${att.fileObject.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `${orgId}/tool_master/${insertedData.id}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, att.fileObject);
          if (uploadError) return att;
          const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
          return { id: att.id, name: att.name, fileName: att.fileObject.name, fileType: att.fileObject.type, fileData: publicUrl, url: publicUrl };
        }
        return att;
      }));

      const { data: updatedData, error: updateError } = await supabase
        .from('tool_master')
        .update({ attachments: finalAttachments })
        .eq('id', insertedData.id)
        .select()
        .single();

      if (!updateError) {
        set(state => ({ tools: [mapFromDb(updatedData), ...state.tools], currentPage: 1 }));
        get().addNotification('Tool master created successfully!', 'success');
        return true;
      }
    }

    set(state => ({ tools: [mapFromDb(insertedData), ...state.tools], currentPage: 1 }));
    get().addNotification('Tool master created successfully!', 'success');
    return true;
  },

  updateTool: async (id, toolData, userId) => {
    const existingTool = get().tools.find(t => t.id === id);
    const toolOrgId = existingTool?.orgId;

    let finalAttachments = toolData.attachments || [];
    if (toolOrgId && finalAttachments.length > 0) {
      finalAttachments = await Promise.all(finalAttachments.map(async (att) => {
        if (att.fileObject) {
          const fileName = `${Date.now()}_${att.fileObject.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `${toolOrgId}/tool_master/${id}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, att.fileObject);
          if (uploadError) return att;
          const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
          return { id: att.id, name: att.name, fileName: att.fileObject.name, fileType: att.fileObject.type, fileData: publicUrl, url: publicUrl };
        }
        return att;
      }));
    }

    const payload = { ...mapToDb({ ...toolData, attachments: finalAttachments }), updated_by: userId };
    const { data, error } = await supabase
      .from('tool_master')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to update tool: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ tools: state.tools.map(t => (t.id === id ? mapFromDb(data) : t)) }));
    get().addNotification('Tool master updated successfully!', 'success');
    return true;
  },

  deleteTool: async (id) => {
    const { error } = await supabase.from('tool_master').delete().eq('id', id);
    if (error) {
      get().addNotification(`Failed to delete tool: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ tools: state.tools.filter(t => t.id !== id) }));
    get().addNotification('Tool master deleted.', 'error');
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
        tools: state.tools.map(t => (t[fieldKey] === oldValue ? { ...t, [fieldKey]: cleaned } : t)),
      };
    });
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deleteLookupOption: async (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().tools.filter(t => t[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} tool(s).`, 'error');
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
  setProcessFilter: (p) => set({ processFilter: p, currentPage: 1 }),
  setStatusFilter: (s) => set({ statusFilter: s, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),

  getFilteredTools: () => {
    const { tools, searchQuery, processFilter, statusFilter } = get();
    const q = searchQuery.toLowerCase().trim();
    return tools.filter(t => {
      const matchSearch = !q || Object.values(t).some(v => String(v || '').toLowerCase().includes(q));
      const matchProcess = processFilter === 'All' || t.process === processFilter;
      const matchStatus = statusFilter === 'All' || t.status === statusFilter;
      return matchSearch && matchProcess && matchStatus;
    });
  },

  getStats: () => {
    const { tools } = get();
    return {
      total: tools.length,
      active: tools.filter(t => t.status === 'Active').length,
      inactive: tools.filter(t => t.status === 'Inactive').length,
      inMaintenance: tools.filter(t => t.status === 'In Maintenance').length,
    };
  },
}));

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapFromDb(row) {
  return {
    id: row.id,
    orgId: row.org_id,
    toolCode: row.tool_code,
    toolName: row.tool_name,
    linkedPartName: row.linked_part_name,
    partRevision: row.part_revision,
    process: row.process,
    numberOfCavities: Number(row.number_of_cavities || 0),
    cycleTime: row.cycle_time,
    pressTonnage: row.press_tonnage,
    toolMaterial: row.tool_material,
    weight: row.weight,
    dimensions: row.dimensions,
    moldType: row.mold_type,
    shrinkageFactor: row.shrinkage_factor,
    lastMaintenanceDate: row.last_maintenance_date,
    nextMaintenanceDue: row.next_maintenance_due,
    maintenanceFrequency: row.maintenance_frequency,
    totalShotCount: Number(row.total_shot_count || 0),
    maximumToolLife: row.maximum_tool_life,
    toolMaker: row.tool_maker,
    supplierContact: row.supplier_contact,
    toolCost: Number(row.tool_cost || 0),
    purchaseDate: row.purchase_date,
    warrantyExpiry: row.warranty_expiry,
    status: row.status,
    remarks: row.remarks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachments: row.attachments || [],
  };
}

function mapToDb(data, orgId, userId) {
  const payload = {
    tool_code: data.toolCode || 'Auto-generated',
    tool_name: data.toolName,
    linked_part_name: data.linkedPartName,
    part_revision: data.partRevision,
    process: data.process,
    number_of_cavities: Number(data.numberOfCavities || 1),
    cycle_time: data.cycleTime,
    press_tonnage: data.pressTonnage,
    tool_material: data.toolMaterial,
    weight: data.weight,
    dimensions: data.dimensions,
    mold_type: data.moldType,
    shrinkage_factor: data.shrinkageFactor,
    last_maintenance_date: data.lastMaintenanceDate || null,
    next_maintenance_due: data.nextMaintenanceDue || null,
    maintenance_frequency: data.maintenanceFrequency,
    total_shot_count: Number(data.totalShotCount || 0),
    maximum_tool_life: data.maximumToolLife,
    tool_maker: data.toolMaker,
    supplier_contact: data.supplierContact,
    tool_cost: Number(data.toolCost || 0),
    purchase_date: data.purchaseDate || null,
    warranty_expiry: data.warrantyExpiry || null,
    status: data.status || 'Active',
    remarks: data.remarks,
    attachments: data.attachments || [],
  };
  if (orgId) payload.org_id = orgId;
  if (userId) payload.created_by = userId;
  return payload;
}
