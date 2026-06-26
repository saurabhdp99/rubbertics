import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useMachineMasterStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  machines: [],
  isLoading: false,
  error: null,

  searchQuery: '',
  departmentFilter: 'All',
  statusFilter: 'All',
  currentPage: 1,
  itemsPerPage: 10,

  lookups: {
    rubberProcess: [
      'Compression Moulding', 'Injection Moulding', 'Extrusion', 'Trimming',
      'Deflashing', 'Finishing', 'Packing', 'Incoming Inspection', 'Final Inspection',
      'Preventive Maintenance', 'Breakdown Maintenance', 'Tool Maintenance', 'Calibration', 'Dispatch',
    ],
    criticality: ['Critical', 'High', 'Medium', 'Low', 'Standby'],
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

  fetchMachines: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from('machine_master')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load machine master.', 'error');
      return;
    }
    set({ machines: (data || []).map(mapFromDb), isLoading: false });
  },

  addMachine: async (machineData, orgId, userId) => {
    const payload = mapToDb(machineData, orgId, userId);
    const { data, error } = await supabase
      .from('machine_master')
      .insert([payload])
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to create machine: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ machines: [mapFromDb(data), ...state.machines], currentPage: 1 }));
    get().addNotification('Machine master created successfully!', 'success');
    return true;
  },

  updateMachine: async (id, machineData, userId) => {
    const payload = { ...mapToDb(machineData), updated_by: userId };
    const { data, error } = await supabase
      .from('machine_master')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to update machine: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ machines: state.machines.map(m => (m.id === id ? mapFromDb(data) : m)) }));
    get().addNotification('Machine master updated successfully!', 'success');
    return true;
  },

  deleteMachine: async (id) => {
    const { error } = await supabase.from('machine_master').delete().eq('id', id);
    if (error) {
      get().addNotification(`Failed to delete machine: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ machines: state.machines.filter(m => m.id !== id) }));
    get().addNotification('Machine master deleted.', 'error');
    return true;
  },

  // ── Lookup management (in-memory) ─────────────────────────────────────
  addLookupOption: (fieldKey, value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return false;
    let wasAdded = false;
    set(state => {
      const current = state.lookups[fieldKey] || [];
      if (current.some(o => o.toLowerCase() === cleaned.toLowerCase())) return state;
      wasAdded = true;
      return { lookups: { ...state.lookups, [fieldKey]: [...current, cleaned] } };
    });
    if (wasAdded) get().addNotification(`"${cleaned}" added`, 'success');
    return wasAdded;
  },

  renameLookupOption: (fieldKey, oldValue, newValue) => {
    const cleaned = String(newValue || '').trim();
    if (!fieldKey || !oldValue || !cleaned) return false;
    let renamed = false;
    set(state => {
      const current = state.lookups[fieldKey] || [];
      if (current.some(o => o.toLowerCase() === cleaned.toLowerCase() && o !== oldValue)) return state;
      renamed = true;
      return {
        lookups: { ...state.lookups, [fieldKey]: current.map(o => (o === oldValue ? cleaned : o)) },
        machines: state.machines.map(m => (m[fieldKey] === oldValue ? { ...m, [fieldKey]: cleaned } : m)),
      };
    });
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deleteLookupOption: (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().machines.filter(m => m[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} machine(s).`, 'error');
      return false;
    }
    set(state => ({
      lookups: { ...state.lookups, [fieldKey]: (state.lookups[fieldKey] || []).filter(o => o !== value) },
    }));
    get().addNotification(`"${value}" deleted`, 'error');
    return true;
  },

  // ── UI ─────────────────────────────────────────────────────────────────
  setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),
  setDepartmentFilter: (d) => set({ departmentFilter: d, currentPage: 1 }),
  setStatusFilter: (s) => set({ statusFilter: s, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),

  getFilteredMachines: () => {
    const { machines, searchQuery, departmentFilter, statusFilter } = get();
    const q = searchQuery.toLowerCase().trim();
    return machines.filter(m => {
      const matchSearch = !q || Object.values(m).some(v => String(v || '').toLowerCase().includes(q));
      const matchDept = departmentFilter === 'All' || m.departmentOfUse === departmentFilter;
      const matchStatus = statusFilter === 'All' || m.status === statusFilter;
      return matchSearch && matchDept && matchStatus;
    });
  },

  getStats: () => {
    const { machines } = get();
    return {
      total: machines.length,
      active: machines.filter(m => m.status === 'Active').length,
      inactive: machines.filter(m => m.status === 'Inactive').length,
    };
  },
}));

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapFromDb(row) {
  return {
    id: row.id,
    orgId: row.org_id,
    machineCode: row.machine_code,
    machineName: row.machine_name,
    machineType: row.machine_type,
    machineMake: row.machine_make,
    machineModel: row.machine_model,
    serialNo: row.serial_no,
    machineSize: row.machine_size,
    capacity: Number(row.capacity || 0),
    capacityUnit: row.capacity_unit,
    departmentOfUse: row.department_of_use,
    locationArea: row.location_area,
    rubberProcess: row.rubber_process,
    powerHpKw: Number(row.power_hp_kw || 0),
    installationDate: row.installation_date,
    pmFrequency: row.pm_frequency,
    lastPmDate: row.last_pm_date,
    nextPmDueDate: row.next_pm_due_date,
    pmStatus: row.pm_status,
    criticality: row.criticality,
    machineCondition: row.machine_condition,
    responsiblePerson: row.responsible_person,
    status: row.status,
    remarks: row.remarks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapToDb(data, orgId, userId) {
  const payload = {
    machine_code: data.machineCode,
    machine_name: data.machineName,
    machine_type: data.machineType,
    machine_make: data.machineMake,
    machine_model: data.machineModel,
    serial_no: data.serialNo,
    machine_size: data.machineSize,
    capacity: Number(data.capacity || 0),
    capacity_unit: data.capacityUnit,
    department_of_use: data.departmentOfUse,
    location_area: data.locationArea,
    rubber_process: data.rubberProcess,
    power_hp_kw: Number(data.powerHpKw || 0),
    installation_date: data.installationDate || null,
    pm_frequency: data.pmFrequency,
    last_pm_date: data.lastPmDate || null,
    next_pm_due_date: data.nextPmDueDate || null,
    pm_status: data.pmStatus || 'OK',
    criticality: data.criticality || 'Medium',
    machine_condition: data.machineCondition || 'Good',
    responsible_person: data.responsiblePerson,
    status: data.status || 'Active',
    remarks: data.remarks,
  };
  if (orgId) payload.org_id = orgId;
  if (userId) payload.created_by = userId;
  return payload;
}
