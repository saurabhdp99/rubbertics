import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useWorkOrderStore = create((set, get) => ({
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
      .from('work_orders')
      .select('*')
      .eq('org_id', orgId)
      .order('id', { ascending: false });

    if (error) {
      set({ error: error.message, isLoading: false });
      get().addNotification('Failed to load work orders.', 'error');
      return;
    }
    set({ entries: data || [], isLoading: false });
  },

  addEntry: async (entryData, orgId, userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .insert([{ ...entryData, org_id: orgId, created_by: userId }])
        .select()
        .single();
      
      if (error) throw error;
      
      set(state => ({
        entries: [data, ...state.entries],
        isLoading: false
      }));
      get().addNotification('Work order created successfully');
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      get().addNotification(err.message || 'Failed to create work order', 'error');
      throw err;
    }
  },

  updateEntry: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      set(state => ({
        entries: state.entries.map(e => e.id === id ? data : e),
        isLoading: false
      }));
      get().addNotification('Work order updated successfully');
      return data;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      get().addNotification(err.message || 'Failed to update work order', 'error');
      throw err;
    }
  },

  deleteEntry: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('work_orders')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      set(state => ({
        entries: state.entries.filter(e => e.id !== id),
        isLoading: false
      }));
      get().addNotification('Work order deleted successfully');
    } catch (err) {
      set({ error: err.message, isLoading: false });
      get().addNotification(err.message || 'Failed to delete work order', 'error');
      throw err;
    }
  }
}));
