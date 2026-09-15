import { create } from 'zustand';

const STORAGE_KEY = 'rubbertics_sidebar_collapsed';

export const useSidebarStore = create((set) => ({
  isCollapsed: (() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  })(),

  toggleSidebar: () =>
    set((state) => {
      const nextState = !state.isCollapsed;
      try {
        localStorage.setItem(STORAGE_KEY, String(nextState));
      } catch (e) {
        console.error('Failed to save sidebar state to localStorage', e);
      }
      return { isCollapsed: nextState };
    }),

  setCollapsed: (collapsed) =>
    set(() => {
      try {
        localStorage.setItem(STORAGE_KEY, String(collapsed));
      } catch (e) {
        console.error('Failed to save sidebar state to localStorage', e);
      }
      return { isCollapsed: !!collapsed };
    }),
}));
