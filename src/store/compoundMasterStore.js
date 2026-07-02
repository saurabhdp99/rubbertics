import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

const DEFAULT_LOOKUPS = {
  compoundColour: [
    'Black',
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'White',
    'Translucent',
    'Grey',
    'Orange',
    'Brown',
  ],
  uom: [
    'kg',
    'g',
    'ltrs',
    'ml',
    'phr',
    '%',
    'pcs',
  ],
  storageCondition: [
    'Store in a cool, dry place below 25°C away from direct sunlight',
    'Room Temperature (20-25°C)',
    'Refrigerated (2-8°C)',
    'Air-conditioned warehouse below 20°C',
    'Store in dry condition, sealed bags',
  ],
};

export const useCompoundMasterStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  compounds: [],
  historyMap: {}, // compoundId -> array of history snapshots
  isHistoryLoading: false,
  isLoading: false,
  error: null,

  searchQuery: '',
  colourFilter: 'All',
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

  fetchCompounds: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });

    // Fetch lookups
    const { data: lookupsData } = await supabase
      .from('app_lookups')
      .select('*')
      .eq('org_id', orgId);

    const { data, error } = await supabase
      .from('compound_master')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load compound master.', 'error');
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
        compounds: (data || []).map(mapFromDb), 
        isLoading: false,
        lookups: finalLookups
      };
    });
  },

  fetchCompoundHistory: async (compoundId) => {
    if (!compoundId) return [];
    set({ isHistoryLoading: true });
    
    const { data, error } = await supabase
      .from('compound_master_history')
      .select('*, profiles:modified_by(email)')
      .eq('compound_id', compoundId)
      .order('revision_number', { ascending: false });

    set({ isHistoryLoading: false });
    if (error) {
      console.error("Failed to load compound history:", error);
      return [];
    }

    const formattedHistory = (data || []).map(row => ({
      id: row.id,
      compoundId: row.compound_id,
      revisionNumber: row.revision_number,
      revisionDate: row.revision_date,
      modifiedBy: row.profiles?.email || row.modified_by || 'System User',
      changeSummary: row.change_summary || 'Record revised',
      snapshot: mapFromDb(row.snapshot || {}),
      createdAt: row.created_at,
    }));

    set(state => ({
      historyMap: { ...state.historyMap, [compoundId]: formattedHistory }
    }));

    return formattedHistory;
  },

  addCompound: async (compoundData, orgId, userId) => {
    const payload = { ...mapToDb(compoundData, orgId, userId), revision_number: 0, revision_date: new Date().toISOString(), attachments: [] };
    const { data: insertedData, error: insertError } = await supabase
      .from('compound_master')
      .insert([payload])
      .select()
      .single();

    if (insertError) {
      get().addNotification(`Failed to create compound: ${insertError.message}`, 'error');
      return false;
    }

    // Log initial history
    await supabase.from('compound_master_history').insert([{
      compound_id: insertedData.id,
      org_id: orgId,
      revision_number: 0,
      revision_date: insertedData.revision_date,
      modified_by: userId,
      change_summary: 'Initial compound formulation created',
      snapshot: insertedData,
    }]);

    let finalAttachments = [];
    if (compoundData.attachments && compoundData.attachments.length > 0) {
      finalAttachments = await Promise.all(compoundData.attachments.map(async (att) => {
        if (att.fileObject) {
          const fileName = `${Date.now()}_${att.fileObject.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `${orgId}/compound_master/${insertedData.id}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, att.fileObject);
          if (uploadError) return att;
          const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
          return { id: att.id, name: att.name, fileName: att.fileObject.name, fileType: att.fileObject.type, fileData: publicUrl, url: publicUrl };
        }
        return att;
      }));

      const { data: updatedData, error: updateError } = await supabase
        .from('compound_master')
        .update({ attachments: finalAttachments })
        .eq('id', insertedData.id)
        .select()
        .single();

      if (!updateError) {
        set(state => ({ compounds: [mapFromDb(updatedData), ...state.compounds], currentPage: 1 }));
        get().addNotification('Compound master created successfully!', 'success');
        return true;
      }
    }

    set(state => ({ compounds: [mapFromDb(insertedData), ...state.compounds], currentPage: 1 }));
    get().addNotification('Compound master created successfully!', 'success');
    return true;
  },

  updateCompound: async (id, compoundData, changeSummary, userId) => {
    const existingCompound = get().compounds.find(c => c.id === id);
    const compoundOrgId = existingCompound?.orgId;

    if (existingCompound && compoundOrgId) {
      // Archive current state into history table before modifying
      const currentDbSnapshot = mapToDb(existingCompound, compoundOrgId, existingCompound.createdBy);
      await supabase.from('compound_master_history').insert([{
        compound_id: id,
        org_id: compoundOrgId,
        revision_number: existingCompound.revisionNumber || 0,
        revision_date: existingCompound.revisionDate || new Date().toISOString(),
        modified_by: userId,
        change_summary: changeSummary || `Revision ${existingCompound.revisionNumber || 0} archived before modification`,
        snapshot: { ...currentDbSnapshot, id, org_id: compoundOrgId },
      }]);
    }

    let finalAttachments = compoundData.attachments || [];
    if (compoundOrgId && finalAttachments.length > 0) {
      finalAttachments = await Promise.all(finalAttachments.map(async (att) => {
        if (att.fileObject) {
          const fileName = `${Date.now()}_${att.fileObject.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const filePath = `${compoundOrgId}/compound_master/${id}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('attachments').upload(filePath, att.fileObject);
          if (uploadError) return att;
          const { data: { publicUrl } } = supabase.storage.from('attachments').getPublicUrl(filePath);
          return { id: att.id, name: att.name, fileName: att.fileObject.name, fileType: att.fileObject.type, fileData: publicUrl, url: publicUrl };
        }
        return att;
      }));
    }

    const newRevNumber = (existingCompound?.revisionNumber || 0) + 1;
    const newRevDate = new Date().toISOString();

    const payload = {
      ...mapToDb({ ...compoundData, attachments: finalAttachments }),
      revision_number: newRevNumber,
      revision_date: newRevDate,
      updated_by: userId,
    };

    const { data, error } = await supabase
      .from('compound_master')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to update compound: ${error.message}`, 'error');
      return false;
    }

    // Also log the new live revision entry
    await supabase.from('compound_master_history').insert([{
      compound_id: id,
      org_id: compoundOrgId,
      revision_number: newRevNumber,
      revision_date: newRevDate,
      modified_by: userId,
      change_summary: changeSummary || `Upgraded to Rev ${newRevNumber}`,
      snapshot: data,
    }]);

    set(state => ({ compounds: state.compounds.map(c => (c.id === id ? mapFromDb(data) : c)) }));
    get().addNotification(`Compound updated to Rev ${newRevNumber}!`, 'success');
    return true;
  },

  deleteCompound: async (id) => {
    const { error } = await supabase.from('compound_master').delete().eq('id', id);
    if (error) {
      get().addNotification(`Failed to delete compound: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ compounds: state.compounds.filter(c => c.id !== id) }));
    get().addNotification('Compound master deleted.', 'error');
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
        compounds: state.compounds.map(c => (c[fieldKey] === oldValue ? { ...c, [fieldKey]: cleaned } : c)),
      };
    });
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deleteLookupOption: async (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().compounds.filter(c => c[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} compound(s).`, 'error');
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
  setColourFilter: (c) => set({ colourFilter: c, currentPage: 1 }),
  setStatusFilter: (s) => set({ statusFilter: s, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),

  getFilteredCompounds: () => {
    const { compounds, searchQuery, colourFilter, statusFilter } = get();
    const q = searchQuery.toLowerCase().trim();
    return compounds.filter(c => {
      const matchSearch = !q || Object.values(c).some(v => {
        if (typeof v === 'object' && v !== null) return JSON.stringify(v).toLowerCase().includes(q);
        return String(v || '').toLowerCase().includes(q);
      });
      const matchColour = colourFilter === 'All' || c.compoundColour === colourFilter;
      const matchStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchSearch && matchColour && matchStatus;
    });
  },

  getStats: () => {
    const { compounds } = get();
    return {
      total: compounds.length,
      active: compounds.filter(c => c.status === 'Active').length,
      underReview: compounds.filter(c => c.status === 'Under Review').length,
      obsolete: compounds.filter(c => c.status === 'Obsolete' || c.status === 'Inactive').length,
    };
  },
}));

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapFromDb(row) {
  return {
    id: row.id,
    orgId: row.org_id,
    compoundCode: row.compound_code,
    compoundName: row.compound_name,
    compoundColour: row.compound_colour,
    formulation: row.formulation || [],
    totalOutput: Number(row.total_output || 0),
    lessWeightLoss: Number(row.less_weight_loss || 0),
    netWeight: Number(row.net_weight || 0),
    grossWeight: Number(row.gross_weight || 0),
    hardnessShoreA: row.hardness_shore_a,
    specificGravity: row.specific_gravity,
    mooneyViscosity: row.mooney_viscosity,
    tensileStrengthMpa: row.tensile_strength_mpa,
    elongationPercent: row.elongation_percent,
    tearStrength: row.tear_strength,
    compressionSetPercent: row.compression_set_percent,
    shelfLifeDays: row.shelf_life_days ? Number(row.shelf_life_days) : null,
    storageLifeDays: row.storage_life_days ? Number(row.storage_life_days) : null,
    storageCondition: row.storage_condition,
    specialInstruction: row.special_instruction,
    revisionNumber: Number(row.revision_number || 0),
    revisionDate: row.revision_date,
    status: row.status || 'Active',
    remarks: row.remarks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    attachments: row.attachments || [],
  };
}

function mapToDb(data, orgId, userId) {
  const payload = {
    compound_code: data.compoundCode || 'Auto-generated',
    compound_name: data.compoundName,
    compound_colour: data.compoundColour,
    formulation: data.formulation || [],
    total_output: Number(data.totalOutput || 0),
    less_weight_loss: Number(data.lessWeightLoss || 0),
    net_weight: Number(data.netWeight || 0),
    gross_weight: Number(data.grossWeight || 0),
    hardness_shore_a: data.hardnessShoreA,
    specific_gravity: data.specificGravity,
    mooney_viscosity: data.mooneyViscosity,
    tensile_strength_mpa: data.tensileStrengthMpa,
    elongation_percent: data.elongationPercent,
    tear_strength: data.tearStrength,
    compression_set_percent: data.compressionSetPercent,
    shelf_life_days: data.shelfLifeDays ? Number(data.shelfLifeDays) : null,
    storage_life_days: data.storageLifeDays ? Number(data.storageLifeDays) : null,
    storage_condition: data.storageCondition,
    special_instruction: data.specialInstruction,
    revision_number: Number(data.revisionNumber || 0),
    revision_date: data.revisionDate || new Date().toISOString(),
    status: data.status || 'Active',
    remarks: data.remarks,
    attachments: data.attachments || [],
  };
  if (orgId) payload.org_id = orgId;
  if (userId && !data.id) payload.created_by = userId;
  return payload;
}
