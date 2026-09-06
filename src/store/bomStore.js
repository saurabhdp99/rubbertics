import { create } from 'zustand';
import { SAMPLE_BOMS, DEFAULT_BOM, calculateGrossWeight, calculateBOMCost } from '../data/bomTemplate';

const STORAGE_KEY = 'rubbertics_boms_data';

// Load stored BOMs or initialize with realistic sample data
function loadInitialBOMs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading BOMs from storage:', err);
  }
  return SAMPLE_BOMS;
}

function saveBOMs(boms) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boms));
  } catch (err) {
    console.error('Error saving BOMs to storage:', err);
  }
}

export const useBOMStore = create((set, get) => ({
  boms: loadInitialBOMs(),
  isLoading: false,
  selectedBOM: null,

  // Modals state
  isModalOpen: false,
  modalMode: 'create', // 'create' | 'edit' | 'duplicate'
  isDetailModalOpen: false,

  // Search & Filter state
  searchQuery: '',
  statusFilter: 'All', // 'All' | 'Active' | 'Draft' | 'Under Review' | 'Obsolete'
  polymerFilter: 'All',

  // Notifications
  notifications: [],
  addNotification: (message, type = 'success') => {
    const id = Date.now();
    set(state => ({ notifications: [...state.notifications, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ notifications: state.notifications.filter(n => n.id !== id) }));
    }, 3000);
  },

  // State setters
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  setPolymerFilter: (polymer) => set({ polymerFilter: polymer }),
  
  setModalOpen: (isOpen, mode = 'create', bom = null) => {
    set({
      isModalOpen: isOpen,
      modalMode: mode,
      selectedBOM: bom ? { ...bom } : null
    });
  },

  setDetailModalOpen: (isOpen, bom = null) => {
    set({
      isDetailModalOpen: isOpen,
      selectedBOM: bom ? { ...bom } : null
    });
  },

  // CRUD Actions
  addBOM: (bomData) => {
    const boms = get().boms;
    const yearCode = String(new Date().getFullYear()).slice(-2);
    const count = boms.length + 1;
    const autoBomNo = bomData.bomNo?.trim() || `BOM-${yearCode}-${String(count).padStart(3, '0')}`;

    const gross = bomData.grossWeight || calculateGrossWeight(bomData.netWeight, bomData.scrapPercent);

    const newBOM = {
      ...DEFAULT_BOM,
      ...bomData,
      id: crypto.randomUUID ? crypto.randomUUID() : `bom-${Date.now()}`,
      bomNo: autoBomNo,
      grossWeight: gross,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newBOM, ...boms];
    saveBOMs(updated);
    set({ boms: updated, isModalOpen: false });
    get().addNotification(`BOM ${newBOM.bomNo} created successfully`);
    return newBOM;
  },

  updateBOM: (id, updates) => {
    const boms = get().boms;
    const gross = updates.grossWeight || calculateGrossWeight(updates.netWeight, updates.scrapPercent);

    const updated = boms.map(b => {
      if (b.id === id) {
        return {
          ...b,
          ...updates,
          grossWeight: gross,
          updatedAt: new Date().toISOString()
        };
      }
      return b;
    });

    saveBOMs(updated);
    set({ boms: updated, isModalOpen: false, selectedBOM: null });
    get().addNotification(`BOM updated successfully`);
  },

  deleteBOM: (id) => {
    const boms = get().boms;
    const toDelete = boms.find(b => b.id === id);
    const updated = boms.filter(b => b.id !== id);
    saveBOMs(updated);
    set({ boms: updated, isDetailModalOpen: false });
    get().addNotification(`BOM ${toDelete?.bomNo || ''} deleted`, 'info');
  },

  duplicateBOM: (id) => {
    const boms = get().boms;
    const original = boms.find(b => b.id === id);
    if (!original) return;

    // Parse current revision and increment
    let newRev = 'Rev 2.0';
    if (original.revisionNo) {
      const match = original.revisionNo.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        const num = parseFloat(match[1]);
        newRev = `Rev ${(num + 1).toFixed(1)}`;
      }
    }

    const yearCode = String(new Date().getFullYear()).slice(-2);
    const count = boms.length + 1;
    const newBomNo = `BOM-${yearCode}-${String(count).padStart(3, '0')}`;

    const duplicated = {
      ...original,
      id: crypto.randomUUID ? crypto.randomUUID() : `bom-${Date.now()}`,
      bomNo: newBomNo,
      bomTitle: `${original.bomTitle} (${newRev})`,
      revisionNo: newRev,
      status: 'Draft',
      effectiveDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    set({
      isModalOpen: true,
      modalMode: 'duplicate',
      selectedBOM: duplicated
    });
    get().addNotification(`Drafting new revision ${newRev} from ${original.bomNo}`);
  },

  toggleStatus: (id, newStatus) => {
    const boms = get().boms;
    const updated = boms.map(b => b.id === id ? { ...b, status: newStatus, updatedAt: new Date().toISOString() } : b);
    saveBOMs(updated);
    set({ boms: updated });
    get().addNotification(`BOM status updated to ${newStatus}`);
  },

  resetToSampleData: () => {
    saveBOMs(SAMPLE_BOMS);
    set({ boms: SAMPLE_BOMS });
    get().addNotification('BOM records reset to standard industry templates');
  },

  exportToCSV: () => {
    const boms = get().boms;
    if (boms.length === 0) {
      get().addNotification('No BOM records to export', 'error');
      return;
    }

    const headers = [
      'BOM No', 'Title', 'Item Code', 'Item Name', 'Customer Part No', 'Drawing No',
      'Revision', 'Status', 'Polymer', 'Compound Code', 'Colour', 'Hardness',
      'Net Wt (g)', 'Scrap %', 'Gross Wt (g)', 'Compound Rate', 'Mould Code', 'Cavities',
      'Cycle Time (s)', 'Est Unit Cost', 'Batch Qty'
    ];

    const rows = boms.map(b => {
      const costs = calculateBOMCost(b);
      return [
        `"${b.bomNo}"`,
        `"${b.bomTitle || ''}"`,
        `"${b.itemCode || ''}"`,
        `"${b.itemName || ''}"`,
        `"${b.customerPartNo || ''}"`,
        `"${b.drawingNo || ''}"`,
        `"${b.revisionNo || ''}"`,
        `"${b.status || ''}"`,
        `"${b.polymer || ''}"`,
        `"${b.compoundCode || ''}"`,
        `"${b.colour || ''}"`,
        `"${b.hardness || ''}"`,
        b.netWeight || 0,
        b.scrapPercent || 0,
        b.grossWeight || 0,
        b.compoundRate || 0,
        `"${b.mouldCode || ''}"`,
        b.cavities || 1,
        b.cycleTimeSec || 0,
        costs.totalUnitCost,
        b.batchQty || 100
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rubbertics_BOM_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    get().addNotification('Exported Bill of Materials to CSV successfully');
  }
}));
