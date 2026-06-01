import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Demo organization with pre-seeded data
const DEMO_ORG = {
  id: 'demo-org',
  name: 'Nisarg Industries (Demo)',
  slug: 'nisarg-industries',
  industry: 'Manufacturing',
  size: '51-200',
  logo: null,
  createdAt: '2024-01-01',
  isDemo: true,
};

// Hardcoded demo users for the demo org
const DEMO_USERS = [
  { email: 'admin@nisarg.com', password: 'admin123', name: 'Admin User', role: 'Admin' },
  { email: 'demo@rubbertics.com', password: 'demo123', name: 'Demo User', role: 'Manager' },
];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Auth state
      isAuthenticated: false,
      currentUser: null,
      authError: null,
      isLoading: false,

      // Organization state
      currentOrg: null,
      organizations: [DEMO_ORG],

      // --- ACTIONS ---

      login: async (email, password) => {
        set({ isLoading: true, authError: null });
        await new Promise((r) => setTimeout(r, 900)); // simulate network

        const user = DEMO_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (user) {
          set({
            isAuthenticated: true,
            currentUser: { email: user.email, name: user.name, role: user.role },
            authError: null,
            isLoading: false,
          });
          return true;
        } else {
          set({
            authError: 'Invalid email or password. Try demo@rubbertics.com / demo123',
            isLoading: false,
          });
          return false;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          currentUser: null,
          currentOrg: null,
          authError: null,
        });
      },

      selectOrganization: (org) => {
        set({ currentOrg: org });
      },

      createOrganization: (orgData) => {
        const newOrg = {
          id: `org-${Date.now()}`,
          name: orgData.name,
          slug: orgData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
          industry: orgData.industry,
          size: orgData.size,
          logo: null,
          createdAt: new Date().toISOString().split('T')[0],
          isDemo: false,
        };
        set((state) => ({
          organizations: [...state.organizations, newOrg],
          currentOrg: newOrg,
        }));
        return newOrg;
      },

      clearError: () => set({ authError: null }),
    }),
    {
      name: 'rubbertics-auth',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        currentUser: state.currentUser,
        currentOrg: state.currentOrg,
        organizations: state.organizations,
      }),
    }
  )
);
