import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useAuthStore } from './authStore';

const DEFAULT_LOOKUPS = {
  enquirySource: ['Email', 'Phone', 'Website', 'Referral', 'Exhibition'],
  salesPerson: ['Admin', 'Sales Executive 1', 'Sales Manager'],
  status: ['Open', 'In Progress', 'Won', 'Lost', 'On Hold'],
};

export const useEnquiryStore = create((set, get) => ({
  // ── State ──────────────────────────────────────────────────────────────
  enquiries: [],
  isLoading: false,
  error: null,

  searchQuery: '',
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

  fetchEnquiries: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });

    // Fetch lookups
    const { data: lookupsData } = await supabase
      .from('app_lookups')
      .select('*')
      .eq('org_id', orgId);

    const { data, error } = await supabase
      .from('enquiry_register')
      .select('*')
      .eq('org_id', orgId)
      .order('enquiry_date', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load enquiries.', 'error');
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
        enquiries: (data || []).map(mapFromDb), 
        isLoading: false,
        lookups: finalLookups
      };
    });
  },

  addEnquiry: async (enquiryData, orgId, userId) => {
    const payload = mapToDb(enquiryData, orgId, userId);
    const { data, error } = await supabase
      .from('enquiry_register')
      .insert([payload])
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to create enquiry: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ enquiries: [mapFromDb(data), ...state.enquiries] }));
    get().addNotification('Enquiry created successfully!', 'success');
    return true;
  },

  updateEnquiry: async (id, enquiryData, userId) => {
    const payload = { ...mapToDb(enquiryData), updated_by: userId };
    const { data, error } = await supabase
      .from('enquiry_register')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      get().addNotification(`Failed to update enquiry: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ enquiries: state.enquiries.map(e => (e.id === id ? mapFromDb(data) : e)) }));
    get().addNotification('Enquiry updated successfully!', 'success');
    return true;
  },

  deleteEnquiry: async (id) => {
    const { error } = await supabase.from('enquiry_register').delete().eq('id', id);
    if (error) {
      get().addNotification(`Failed to delete enquiry: ${error.message}`, 'error');
      return false;
    }
    set(state => ({ enquiries: state.enquiries.filter(e => e.id !== id) }));
    get().addNotification('Enquiry deleted.', 'error');
    return true;
  },

  // ── Lookup management (in-memory) ─────────────────────────────────────
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
        enquiries: state.enquiries.map(e => (e[fieldKey] === oldValue ? { ...e, [fieldKey]: cleaned } : e)),
      };
    });
    if (renamed) get().addNotification(`"${oldValue}" renamed to "${cleaned}"`, 'success');
    return renamed;
  },

  deleteLookupOption: async (fieldKey, value) => {
    if (!fieldKey || !value) return false;
    const usedCount = get().enquiries.filter(e => e[fieldKey] === value).length;
    if (usedCount > 0) {
      get().addNotification(`Cannot delete "${value}"; used in ${usedCount} enquiry(s).`, 'error');
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
  setCurrentPage: (p) => set({ currentPage: p }),
  setItemsPerPage: (n) => set({ itemsPerPage: n, currentPage: 1 }),

  getFilteredEnquiries: () => {
    const { enquiries, searchQuery } = get();
    const q = searchQuery.toLowerCase().trim();
    return enquiries.filter(e =>
      !q || Object.values(e).some(v => String(v || '').toLowerCase().includes(q))
    );
  },

  getStats: () => {
    const { enquiries } = get();
    return {
      total: enquiries.length,
      open: enquiries.filter(e => e.status === 'Open').length,
      won: enquiries.filter(e => e.status === 'Won').length,
      lost: enquiries.filter(e => e.status === 'Lost').length,
    };
  },
}));

// ── Mappers ────────────────────────────────────────────────────────────────────
function mapFromDb(row) {
  return {
    id: row.id,
    orgId: row.org_id,
    enquiryNo: row.enquiry_no,
    enquiryDate: row.enquiry_date,
    partyName: row.party_name,
    contactPerson: row.contact_person,
    contactNo: row.contact_no,
    email: row.email,
    productDescription: row.product_description,
    quantity: Number(row.quantity || 0),
    enquirySource: row.enquiry_source,
    salesPerson: row.sales_person,
    expectedOrderDate: row.expected_order_date,
    remarks: row.remarks,
    status: row.status,
    attachmentUrl: row.attachment_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapToDb(data, orgId, userId) {
  const payload = {
    enquiry_no: data.enquiryNo,
    enquiry_date: data.enquiryDate || new Date().toISOString().split('T')[0],
    party_name: data.partyName,
    contact_person: data.contactPerson,
    contact_no: data.contactNo,
    email: data.email,
    product_description: data.productDescription,
    quantity: Number(data.quantity || 0),
    enquiry_source: data.enquirySource || 'Email',
    sales_person: data.salesPerson,
    expected_order_date: data.expectedOrderDate || null,
    remarks: data.remarks,
    status: data.status || 'Open',
    attachment_url: data.attachmentUrl,
  };
  if (orgId) payload.org_id = orgId;
  if (userId) payload.created_by = userId;
  return payload;
}
