import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useMixingProductionStore = create((set, get) => ({
  entries: [],
  isLoading: false,

  fetchEntries: async (orgId) => {
    if (!orgId) return;
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('mixing_production_entries')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ entries: data || [] });
    } catch (error) {
      console.error('Failed to fetch mixing production entries', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addEntry: async (entry, orgId) => {
    if (!orgId) {
      alert('Organization ID is missing');
      return false;
    }
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('mixing_production_entries')
        .insert([{ ...entry, org_id: orgId }])
        .select()
        .single();

      if (error) throw error;
      
      set(state => ({ entries: [data, ...state.entries] }));
      return true;
    } catch (error) {
      alert('Failed to add entry');
      console.error(error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateEntry: async (id, updates) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('mixing_production_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        entries: state.entries.map(e => e.id === id ? data : e)
      }));
      return true;
    } catch (error) {
      alert('Failed to update entry');
      console.error(error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteEntry: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('mixing_production_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        entries: state.entries.filter(e => e.id !== id)
      }));
      return true;
    } catch (error) {
      alert('Failed to delete entry');
      console.error(error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));
