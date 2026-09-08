import { create } from 'zustand';
import { INITIAL_DISPATCH_DATA, getNextInvoiceNo, getNextSrNo } from '../data/dispatchTemplate';

const STORAGE_KEY = 'rubbertics_dispatch_data';

function loadInitialDispatches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading dispatch data from storage:', err);
  }
  return INITIAL_DISPATCH_DATA;
}

function saveDispatches(dispatches) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dispatches));
  } catch (err) {
    console.error('Error saving dispatch data to storage:', err);
  }
}

export const useDispatchStore = create((set, get) => ({
  dispatches: loadInitialDispatches(),
  selectedDispatch: null,
  isFormOpen: false,
  formMode: 'add', // 'add' | 'edit' | 'view'
  isDeleteConfirmOpen: false,
  dispatchToDelete: null,
  notifications: [],

  addNotification: (message, type = 'success') => {
    const id = Date.now();
    set((state) => ({ notifications: [...state.notifications, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ notifications: state.notifications.filter((n) => n.id !== id) }));
    }, 3200);
  },

  openForm: (mode = 'add', dispatch = null) => {
    set({
      formMode: mode,
      selectedDispatch: dispatch,
      isFormOpen: true,
    });
  },

  closeForm: () => {
    set({
      isFormOpen: false,
      selectedDispatch: null,
    });
  },

  setDeleteConfirmOpen: (isOpen, dispatch = null) => {
    set({
      isDeleteConfirmOpen: isOpen,
      dispatchToDelete: dispatch,
    });
  },

  addDispatch: (entryData) => {
    const current = get().dispatches;
    const newId = `disp-${Date.now()}`;
    const srNo = entryData.srNo ? Number(entryData.srNo) : getNextSrNo(current);
    const invoiceNo = entryData.invoiceNo?.trim() || getNextInvoiceNo(current);

    const newDispatch = {
      ...entryData,
      id: newId,
      srNo,
      invoiceNo,
      quantity: Number(entryData.quantity || 0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newDispatch, ...current];
    set({ dispatches: updated, isFormOpen: false, selectedDispatch: null });
    saveDispatches(updated);
    get().addNotification(`Dispatch invoice ${newDispatch.invoiceNo} created successfully!`, 'success');
    return newDispatch;
  },

  updateDispatch: (id, updates) => {
    const current = get().dispatches;
    const updated = current.map((d) => {
      if (d.id === id) {
        return {
          ...d,
          ...updates,
          quantity: Number(updates.quantity !== undefined ? updates.quantity : d.quantity),
          updatedAt: new Date().toISOString(),
        };
      }
      return d;
    });

    set({ dispatches: updated, isFormOpen: false, selectedDispatch: null });
    saveDispatches(updated);
    get().addNotification('Dispatch entry updated successfully!', 'success');
  },

  deleteDispatch: (id) => {
    const current = get().dispatches;
    const itemToDelete = current.find((d) => d.id === id);
    const updated = current.filter((d) => d.id !== id);

    set({
      dispatches: updated,
      isDeleteConfirmOpen: false,
      dispatchToDelete: null,
      selectedDispatch: null,
    });
    saveDispatches(updated);
    get().addNotification(
      `Dispatch entry ${itemToDelete?.invoiceNo || ''} deleted successfully.`,
      'info'
    );
  },

  resetToInitial: () => {
    set({ dispatches: INITIAL_DISPATCH_DATA });
    saveDispatches(INITIAL_DISPATCH_DATA);
    get().addNotification('Reset to sample dispatch records', 'info');
  },
}));
