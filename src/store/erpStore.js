import { create } from 'zustand';

const initialWeeklyPlans = [
  {
    id: 1,
    partName: '300WATT JALI GASKET',
    partNo: 'PG-JALI-001',
    machineSize: '250 Ton',
    workOrderNo: 'WO-2024-089',
    cavity: 1,
    schedule: {
      monday: {
        day: { plan: 250, actual: 222, operator: 'GAUTAM' },
        night: { plan: 240, actual: 235, operator: 'RAMESH' }
      },
      tuesday: {
        day: { plan: 250, actual: 240, operator: 'GAUTAM' },
        night: { plan: 240, actual: 242, operator: 'RAMESH' }
      },
      wednesday: {
        day: { plan: 260, actual: 255, operator: 'GAUTAM' },
        night: { plan: 240, actual: 238, operator: 'RAMESH' }
      },
      thursday: {
        day: { plan: 250, actual: 248, operator: 'SANDEEP' },
        night: { plan: 240, actual: 240, operator: 'SURESH' }
      },
      friday: {
        day: { plan: 250, actual: 252, operator: 'SANDEEP' },
        night: { plan: 240, actual: 230, operator: 'SURESH' }
      },
      saturday: {
        day: { plan: 220, actual: 210, operator: 'SANDEEP' },
        night: { plan: 200, actual: 195, operator: 'SURESH' }
      }
    }
  },
  {
    id: 2,
    partName: 'CT BOOT',
    partNo: 'BT-CT-552',
    machineSize: '150 Ton',
    workOrderNo: 'WO-2024-112',
    cavity: 6,
    schedule: {
      monday: {
        day: { plan: 240, actual: 193, operator: 'SANDEEP' },
        night: { plan: 220, actual: 210, operator: 'AJAY' }
      },
      tuesday: {
        day: { plan: 240, actual: 235, operator: 'SANDEEP' },
        night: { plan: 220, actual: 215, operator: 'AJAY' }
      },
      wednesday: {
        day: { plan: 240, actual: 242, operator: 'SANDEEP' },
        night: { plan: 220, actual: 220, operator: 'AJAY' }
      },
      thursday: {
        day: { plan: 240, actual: 238, operator: 'GAUTAM' },
        night: { plan: 220, actual: 218, operator: 'RAMESH' }
      },
      friday: {
        day: { plan: 240, actual: 245, operator: 'GAUTAM' },
        night: { plan: 220, actual: 222, operator: 'RAMESH' }
      },
      saturday: {
        day: { plan: 200, actual: 190, operator: 'GAUTAM' },
        night: { plan: 180, actual: 175, operator: 'RAMESH' }
      }
    }
  }
];

let nextWeeklyPlanId = 3;

export const useERPStore = create((set, get) => ({
  // Residual Data
  weeklyPlans: initialWeeklyPlans,

  // UI State for Weekly Plans
  isWeeklyModalOpen: false,
  selectedWeeklyPlan: null,

  // Weekly Plan Actions
  openWeeklyModal: (plan = null) => set({ isWeeklyModalOpen: true, selectedWeeklyPlan: plan }),
  closeWeeklyModal: () => set({ isWeeklyModalOpen: false, selectedWeeklyPlan: null }),

  addWeeklyPlan: (planData) => {
    const newPlan = {
      ...planData,
      id: nextWeeklyPlanId++,
    };
    set(state => ({ weeklyPlans: [newPlan, ...state.weeklyPlans] }));
    get().addNotification('Weekly plan created successfully!', 'success');
    get().closeWeeklyModal();
  },

  updateWeeklyPlan: (id, planData) => {
    set(state => ({
      weeklyPlans: state.weeklyPlans.map(p =>
        p.id === id ? { ...p, ...planData } : p
      ),
    }));
    get().addNotification('Weekly plan updated successfully!', 'success');
    get().closeWeeklyModal();
  },

  deleteWeeklyPlan: (id) => {
    set(state => ({
      weeklyPlans: state.weeklyPlans.filter(p => p.id !== id),
    }));
    get().addNotification('Weekly plan deleted successfully!', 'error');
  },

  // Notification System
  notifications: [],
  addNotification: (message, type = 'success') => {
    const id = Date.now();
    set(state => ({
      notifications: [...state.notifications, { id, message, type }]
    }));
    setTimeout(() => {
      get().removeNotification(id);
    }, 3000);
  },
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(n => n.id !== id)
    }));
  },
}));
