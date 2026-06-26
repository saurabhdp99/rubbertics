import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const getCategoryPrefix = (category) => {
  if (!category) return 'CU-';
  const map = { Customer: 'CU-', Vendor: 'VE-', 'Job Work': 'JW-', Service: 'SE-' };
  return map[category] || category.substring(0, 2).toUpperCase() + '-';
};

export const usePartyMasterStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  parties: [],
  isLoading: false,
  error: null,

  searchQuery: '',
  typeFilter: 'All',
  msmeFilter: 'All',
  currentPage: 1,
  itemsPerPage: 10,

  lookups: {
    partyCategory: ['Customer', 'Vendor', 'Job Work', 'Service'],
    msmeEnterpriseType: ['Not Applicable', 'Micro', 'Small', 'Medium'],
  },
  partyCategories: ['Customer', 'Vendor', 'Job Work', 'Service'],

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

  fetchParties: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from('party_master')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load party master.', 'error');
      return;
    }
    set({ parties: (data || []).map(mapFromDb), isLoading: false });
  },

  /** Auto-generate next party code based on existing codes for the category */
  getNextPartyCode: (category) => {
    const prefix = getCategoryPrefix(category);
    const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`^${escaped}(\\d+)$`, 'i');
    const maxNum = get().parties.reduce((max, p) => {
      const match = String(p.partyCode || '').match(regex);
      return match ? Math.max(max, Number(match[1])) : max;
    }, 0);
    return `${prefix}${String(maxNum + 1).padStart(2, '0')}`;
  },

  addParty: async (partyData, orgId, userId) => {
    const partyCode = partyData.partyCode || get().getNextPartyCode(partyData.partyCategory);
    const payload = mapToDb({ ...partyData, partyCode }, orgId, userId);
    const { data, error } = await supabase
      .from('party_master')
      .insert([payload])
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to create party: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ parties: [mapFromDb(data), ...state.parties], currentPage: 1 }));
    get().addNotification(`Party ${partyCode} created successfully!`, 'success');
    return true;
  },

  updateParty: async (id, partyData, userId) => {
    const payload = { ...mapToDb(partyData), updated_by: userId };
    const { data, error } = await supabase
      .from('party_master')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to update party: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ parties: state.parties.map(p => (p.id === id ? mapFromDb(data) : p)) }));
    get().addNotification('Party master updated successfully!', 'success');
    return true;
  },

  deleteParty: async (id) => {
    const { error } = await supabase.from('party_master').delete().eq('id', id);
    if (error) {
      get().addNotification(`Failed to delete party: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ parties: state.parties.filter(p => p.id !== id) }));
    get().addNotification('Party master deleted.', 'error');
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
      return {
        lookups: { ...state.lookups, [fieldKey]: [...current, cleaned] },
        ...(fieldKey === 'partyCategory' ? { partyCategories: [...state.partyCategories, cleaned] } : {}),
      };
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
        ...(fieldKey === 'partyCategory'
          ? { partyCategories: state.partyCategories.map(o => (o === oldValue ? cleaned : o)) }
          : {}),
        parties: state.parties.map(p => (p[fieldKey] !== oldValue ? p : { ...p, [fieldKey]: cleaned })),
      };
    });
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deleteLookupOption: (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().parties.filter(p => p[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} part(ies).`, 'error');
      return false;
    }
    set(state => ({
      lookups: { ...state.lookups, [fieldKey]: (state.lookups[fieldKey] || []).filter(o => o !== value) },
      ...(fieldKey === 'partyCategory'
        ? { partyCategories: state.partyCategories.filter(o => o !== value) }
        : {}),
    }));
    get().addNotification(`"${value}" deleted`, 'error');
    return true;
  },

  // ── UI ─────────────────────────────────────────────────────────────────
  setSearchQuery: (q) => set({ searchQuery: q, currentPage: 1 }),
  setTypeFilter: (t) => set({ typeFilter: t, currentPage: 1 }),
  setMsmeFilter: (m) => set({ msmeFilter: m, currentPage: 1 }),
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),

  getFilteredParties: () => {
    const { parties, searchQuery, typeFilter, msmeFilter } = get();
    const q = searchQuery.toLowerCase().trim();
    return parties.filter(p => {
      const matchSearch = !q || Object.values(p).some(v => String(v || '').toLowerCase().includes(q));
      const matchType = typeFilter === 'All' || p.partyType === typeFilter;
      const matchMsme = msmeFilter === 'All' || p.msmeEnterpriseType === msmeFilter;
      return matchSearch && matchType && matchMsme;
    });
  },

  getStats: () => {
    const { parties } = get();
    const types = new Set(parties.map(p => p.partyType).filter(Boolean));
    const msme = parties.filter(p => p.msmeEnterpriseType && p.msmeEnterpriseType !== 'Not Applicable').length;
    const today = new Date();
    const enrolledThisMonth = parties.filter(p => {
      if (!p.partyEnrollmentDate) return false;
      const d = new Date(p.partyEnrollmentDate);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    }).length;
    return { total: parties.length, types: types.size, msme, enrolledThisMonth };
  },
}));

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapFromDb(row) {
  return {
    id: row.id,
    orgId: row.org_id,
    partyName: row.party_name,
    partyCode: row.party_code,
    partyCategory: row.party_category,
    aliasName: row.alias_name,
    natureOfBusiness: row.nature_of_business,
    address: row.address,
    partyType: row.party_type,
    procurementPersonName: row.procurement_person_name,
    procurementContactNo: row.procurement_contact_no,
    procurementEmail: row.procurement_email,
    plannerPersonName: row.planner_person_name,
    plannerContactNo: row.planner_contact_no,
    plannerEmail: row.planner_email,
    accountsPersonName: row.accounts_person_name,
    accountsContactNo: row.accounts_contact_no,
    accountsEmail: row.accounts_email,
    gstNo: row.gst_no,
    gstRegistrationDate: row.gst_registration_date,
    gstStateCode: row.gst_state_code,
    panDetails: row.pan_details,
    msmeCertificateNo: row.msme_certificate_no,
    msmeEnterpriseType: row.msme_enterprise_type,
    msmeCertificateValidity: row.msme_certificate_validity,
    paymentTerms: row.payment_terms,
    deliveryTerms: row.delivery_terms,
    transport: row.transport,
    detailsSharedVia: row.details_shared_via,
    partyEnrollmentDate: row.party_enrollment_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapToDb(data, orgId, userId) {
  const payload = {
    party_name: data.partyName,
    party_code: data.partyCode,
    party_category: data.partyCategory,
    alias_name: data.aliasName,
    nature_of_business: data.natureOfBusiness,
    address: data.address,
    party_type: data.partyType || 'Domestic',
    procurement_person_name: data.procurementPersonName,
    procurement_contact_no: data.procurementContactNo,
    procurement_email: data.procurementEmail,
    planner_person_name: data.plannerPersonName,
    planner_contact_no: data.plannerContactNo,
    planner_email: data.plannerEmail,
    accounts_person_name: data.accountsPersonName,
    accounts_contact_no: data.accountsContactNo,
    accounts_email: data.accountsEmail,
    gst_no: data.gstNo,
    gst_registration_date: data.gstRegistrationDate || null,
    gst_state_code: data.gstStateCode,
    pan_details: data.panDetails,
    msme_certificate_no: data.msmeCertificateNo,
    msme_enterprise_type: data.msmeEnterpriseType || 'Not Applicable',
    msme_certificate_validity: data.msmeCertificateValidity || null,
    payment_terms: data.paymentTerms,
    delivery_terms: data.deliveryTerms,
    transport: data.transport,
    details_shared_via: data.detailsSharedVia || 'Email',
    party_enrollment_date: data.partyEnrollmentDate || new Date().toISOString().split('T')[0],
  };
  if (orgId) payload.org_id = orgId;
  if (userId) payload.created_by = userId;
  return payload;
}
