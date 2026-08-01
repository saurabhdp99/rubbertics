import { create } from 'zustand';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

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
      toast.error('Failed to fetch mixing production entries');
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  addEntry: async (entry, orgId) => {
    if (!orgId) {
      toast.error('Organization ID is missing');
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
      toast.success('Mixing production entry added successfully');
      return true;
    } catch (error) {
      toast.error('Failed to add entry');
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
      toast.success('Entry updated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to update entry');
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
      toast.success('Entry deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete entry');
      console.error(error);
      return false;
    } finally {
      set({ isLoading: false });
    }
  }
}));
