import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useInwardStore = create((set, get) => ({
  // State
  entries: [],
  isLoading: false,
  error: null,
  
  // Modal state
  isModalOpen: false,
  modalMode: 'add',
  selectedEntry: null,
  isDeleteConfirmOpen: false,
  entryToDelete: null,

  // Notifications
  notifications: [],
  addNotification: (message, type = 'success') => {
    const id = Date.now();
    set(state => ({ notifications: [...state.notifications, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ notifications: state.notifications.filter(n => n.id !== id) }));
    }, 3000);
  },

  // Actions
  setModalOpen: (isOpen) => set({ isModalOpen: isOpen }),
  setModalMode: (mode) => set({ modalMode: mode }),
  setSelectedEntry: (entry) => set({ selectedEntry: entry }),
  setDeleteConfirmOpen: (isOpen) => set({ isDeleteConfirmOpen: isOpen }),
  setEntryToDelete: (entry) => set({ entryToDelete: entry }),

  // CRUD Operations
  fetchEntries: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true, error: null });
    const { data, error } = await supabase
      .from('inward_entries')
      .select('*')
      .eq('org_id', orgId)
      .order('receipt_date', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load GRN entries.', 'error');
      return;
    }
    set({ entries: data || [], isLoading: false });
  },

  addEntry: async (entryData, orgId, userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('inward_entries')
        .insert([{ ...entryData, org_id: orgId, created_by: userId }])
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        entries: [data, ...state.entries],
        isLoading: false
      }));
      get().addNotification('GRN entry created successfully');
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      get().addNotification(err.message || 'Failed to create GRN entry', 'error');
      throw err;
    }
  },

  updateEntry: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('inward_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      set(state => ({
        entries: state.entries.map(e => e.id === id ? data : e),
        isLoading: false
      }));
      get().addNotification('GRN entry updated successfully');
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      get().addNotification(err.message || 'Failed to update GRN entry', 'error');
      throw err;
    }
  },

  deleteEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('inward_entries')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      set(state => ({
        entries: state.entries.filter(e => e.id !== id),
        isLoading: false
      }));
      get().addNotification('GRN entry deleted successfully');
    } catch (err) {
      set({ error: err.message, isLoading: false });
      get().addNotification(err.message || 'Failed to delete GRN entry', 'error');
      throw err;
    }
  }
}));
