import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

export const useEmployeeMasterStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  employees: [],
  isLoading: false,
  error: null,

  searchQuery: '',
  departmentFilter: 'All',
  currentPage: 1,
  itemsPerPage: 10,

  lookups: {
    employeeType: ['Permanent', 'Contract', 'Temporary', 'Trainee'],
    gender: ['Male', 'Female', 'Other'],
    bloodGroup: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
    maritalStatus: ['Single', 'Married', 'Divorced', 'Widowed'],
    department: ['Production', 'Mixing', 'Quality Control', 'Maintenance', 'Dispatch', 'Admin'],
    designation: ['Operator', 'Helper', 'QC Inspector', 'Supervisor', 'Manager'],
    addressType: ['Current', 'Permanent'],
    salaryType: ['Monthly', 'Daily Wages'],
    paymentMode: ['Bank Transfer', 'Cash', 'Cheque'],
    skillCategory: ['Machine Operator', 'Helper', 'Supervisor', 'Technician'],
    skillLevel: ['Skilled', 'Semi Skilled', 'Unskilled', 'Highly Skilled'],
    machineTypeKnown: ['Hydraulic Press', 'Mixing Mill', 'Extruder', 'Kneader', 'None'],
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

  fetchEmployees: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });

    // Fetch lookups
    const { data: lookupsData } = await supabase
      .from('app_lookups')
      .select('*')
      .eq('org_id', orgId);

    const { data, error } = await supabase
      .from('employee_master')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load employee master.', 'error');
      return;
    }
    
    set(state => {
      const newLookups = { ...state.lookups };
      if (lookupsData) {
        lookupsData.forEach(item => {
          if (newLookups[item.type] && !newLookups[item.type].includes(item.value)) {
            newLookups[item.type] = [...newLookups[item.type], item.value];
          }
        });
      }
      return { 
        employees: (data || []).map(mapFromDb), 
        isLoading: false,
        lookups: newLookups
      };
    });
  },

  addEmployee: async (employeeData, orgId, userId) => {
    const payload = mapToDb(employeeData, orgId, userId);
    const { data, error } = await supabase
      .from('employee_master')
      .insert([payload])
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to create employee: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ employees: [mapFromDb(data), ...state.employees], currentPage: 1 }));
    get().addNotification('Employee created successfully!', 'success');
    return true;
  },

  updateEmployee: async (id, employeeData, userId) => {
    const payload = { ...mapToDb(employeeData), updated_by: userId };
    const { data, error } = await supabase
      .from('employee_master')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to update employee: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ employees: state.employees.map(e => (e.id === id ? mapFromDb(data) : e)) }));
    get().addNotification('Employee updated successfully!', 'success');
    return true;
  },

  deleteEmployee: async (id) => {
    const { error } = await supabase.from('employee_master').delete().eq('id', id);
    if (error) {
      get().addNotification(`Failed to delete employee: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ employees: state.employees.filter(e => e.id !== id) }));
    get().addNotification('Employee deleted.', 'error');
    return true;
  },

  // ── Lookup management ─────────────────────────────────────
  addLookupOption: async (fieldKey, value) => {
    const cleaned = String(value || '').trim();
    if (!cleaned) return false;
    
    const orgId = useAuthStore.getState().currentOrg?.id;
    let wasAdded = false;
    
    // Check local first
    const currentLocal = get().lookups[fieldKey] || [];
    if (currentLocal.some(o => o.toLowerCase() === cleaned.toLowerCase())) return false;
    
    // Save to backend
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
        employees: state.employees.map(e => (e[fieldKey] === oldValue ? { ...e, [fieldKey]: cleaned } : e)),
      };
    });
    
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deleteLookupOption: async (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().employees.filter(e => e[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} employee(s).`, 'error');
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
  setDepartmentFilter: (d) => set({ departmentFilter: d, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),

  getFilteredEmployees: () => {
    const { employees, searchQuery, departmentFilter } = get();
    const q = searchQuery.toLowerCase().trim();
    return employees.filter(e => {
      const matchSearch = !q || Object.values(e).some(v => String(v || '').toLowerCase().includes(q));
      const matchDept = departmentFilter === 'All' || e.department === departmentFilter;
      return matchSearch && matchDept;
    });
  },

  getStats: () => {
    const { employees } = get();
    const departments = new Set(employees.map(e => e.department).filter(Boolean));
    return {
      total: employees.length,
      departments: departments.size,
      permanent: employees.filter(e => e.employeeType === 'Permanent').length,
      contract: employees.filter(e => e.employeeType === 'Contract').length,
    };
  },
}));

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapFromDb(row) {
  return {
    id: row.id,
    orgId: row.org_id,
    employeeCode: row.employee_code,
    employeeName: row.employee_name,
    employeeType: row.employee_type,
    gender: row.gender,
    dob: row.dob,
    mobileNo: row.mobile_no,
    alternateMobile: row.alternate_mobile,
    email: row.email,
    bloodGroup: row.blood_group,
    maritalStatus: row.marital_status,
    department: row.department,
    designation: row.designation,
    addressType: row.address_type,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    city: row.city,
    district: row.district,
    state: row.state,
    pincode: row.pincode,
    country: row.country,
    isCurrentAddress: row.is_current_address,
    addressRemarks: row.address_remarks,
    panNo: row.pan_no,
    aadhaarNo: row.aadhaar_no,
    uanNo: row.uan_no,
    pfNo: row.pf_no,
    esiNo: row.esi_no,
    professionalTaxNo: row.professional_tax_no,
    pfApplicable: row.pf_applicable,
    esiApplicable: row.esi_applicable,
    statutoryRemarks: row.statutory_remarks,
    salaryType: row.salary_type,
    basicSalary: Number(row.basic_salary || 0),
    hra: Number(row.hra || 0),
    conveyance: Number(row.conveyance || 0),
    otherAllowance: Number(row.other_allowance || 0),
    grossSalary: Number(row.gross_salary || 0),
    pfDeduction: Number(row.pf_deduction || 0),
    esiDeduction: Number(row.esi_deduction || 0),
    otherDeduction: Number(row.other_deduction || 0),
    netSalary: Number(row.net_salary || 0),
    effectiveFrom: row.salary_effective_from,
    salaryRemarks: row.salary_remarks,
    bankName: row.bank_name,
    accountNo: row.account_no,
    ifscCode: row.ifsc_code,
    accountHolderName: row.account_holder_name,
    paymentMode: row.payment_mode,
    upiId: row.upi_id,
    bankRemarks: row.bank_remarks,
    skillCategory: row.skill_category,
    skillLevel: row.skill_level,
    machineTypeKnown: row.machine_type_known,
    canWorkOnCriticalMachine: row.can_work_on_critical_machine,
    trainingRequired: row.training_required,
    lastTrainingDate: row.last_training_date,
    nextTrainingDue: row.next_training_due,
    skillRemarks: row.skill_remarks,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapToDb(data, orgId, userId) {
  const payload = {
    employee_code: data.employeeCode,
    employee_name: data.employeeName,
    employee_type: data.employeeType || 'Permanent',
    gender: data.gender,
    dob: data.dob || null,
    mobile_no: data.mobileNo,
    alternate_mobile: data.alternateMobile,
    email: data.email,
    blood_group: data.bloodGroup,
    marital_status: data.maritalStatus,
    department: data.department,
    designation: data.designation,
    address_type: data.addressType || 'Current',
    address_line1: data.addressLine1,
    address_line2: data.addressLine2,
    city: data.city,
    district: data.district,
    state: data.state,
    pincode: data.pincode,
    country: data.country || 'India',
    is_current_address: data.isCurrentAddress !== undefined ? data.isCurrentAddress : true,
    address_remarks: data.addressRemarks,
    pan_no: data.panNo,
    aadhaar_no: data.aadhaarNo,
    uan_no: data.uanNo,
    pf_no: data.pfNo,
    esi_no: data.esiNo,
    professional_tax_no: data.professionalTaxNo,
    pf_applicable: data.pfApplicable || false,
    esi_applicable: data.esiApplicable || false,
    statutory_remarks: data.statutoryRemarks,
    salary_type: data.salaryType || 'Monthly',
    basic_salary: Number(data.basicSalary || 0),
    hra: Number(data.hra || 0),
    conveyance: Number(data.conveyance || 0),
    other_allowance: Number(data.otherAllowance || 0),
    gross_salary: Number(data.grossSalary || 0),
    pf_deduction: Number(data.pfDeduction || 0),
    esi_deduction: Number(data.esiDeduction || 0),
    other_deduction: Number(data.otherDeduction || 0),
    net_salary: Number(data.netSalary || 0),
    salary_effective_from: data.effectiveFrom || null,
    salary_remarks: data.salaryRemarks,
    bank_name: data.bankName,
    account_no: data.accountNo,
    ifsc_code: data.ifscCode,
    account_holder_name: data.accountHolderName,
    payment_mode: data.paymentMode || 'Bank Transfer',
    upi_id: data.upiId,
    bank_remarks: data.bankRemarks,
    skill_category: data.skillCategory,
    skill_level: data.skillLevel,
    machine_type_known: data.machineTypeKnown,
    can_work_on_critical_machine: data.canWorkOnCriticalMachine || false,
    training_required: data.trainingRequired || false,
    last_training_date: data.lastTrainingDate || null,
    next_training_due: data.nextTrainingDue || null,
    skill_remarks: data.skillRemarks,
  };
  if (orgId) payload.org_id = orgId;
  if (userId) payload.created_by = userId;
  return payload;
}
