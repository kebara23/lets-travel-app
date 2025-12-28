import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, Organization, BrandingConfig, Space, Ticket, SOSAlert } from '../types/database';

export const DUMMY_USER: UserProfile = {
  id: "dummy-user-001",
  email: "demo@awake.os",
  role: 'admin_guardian', // Default to admin for the demo
  organization_id: "org-awake-001",
  full_name: "John Awake (Demo)",
  avatar_url: null,
  current_status: 'active',
  created_at: new Date().toISOString(),
};

interface UserState {
  user: UserProfile | null;
  organization: Organization | null;
  branding: BrandingConfig | null;
  isLoading: boolean;
  
  // --- OFFLINE SIMULATION STATE ---
  mockSpaces: Space[];
  mockTickets: Ticket[];
  mockSOS: SOSAlert[];

  // Actions
  setUser: (user: UserProfile | null) => void;
  setOrganization: (org: Organization | null) => void;
  setBranding: (branding: BrandingConfig | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  // Simulation Actions
  updateMockSpace: (id: string, status: Space['status']) => void;
  updateMockTicket: (id: string, status: Ticket['status']) => void;
  addMockSOS: (sos: SOSAlert) => void;
}

const INITIAL_SPACES: Space[] = [
  { id: "101", organization_id: "org-awake-001", name: "Cabin 01", status: "dirty", type: "room", assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: "102", organization_id: "org-awake-001", name: "Cabin 02", status: "clean", type: "room", assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: "103", organization_id: "org-awake-001", name: "Cabin 03", status: "cleaning", type: "room", assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: "104", organization_id: "org-awake-001", name: "Suite A", status: "maintenance", type: "room", assigned_staff_id: null, created_at: new Date().toISOString() },
];

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null, // Start as null to show login, but we'll have a button to 'Quick Login'
      organization: {
        id: "org-awake-001",
        name: "Awake Resort",
        branding_config: {
          primary_color: "#1B4734",
          accent_color: "#C9A24E",
          bg_color: "#F5EFE6",
          logo_url: null,
          font_family: "Geist"
        },
        created_at: new Date().toISOString()
      },
      branding: {
        primary_color: "#1B4734",
        accent_color: "#C9A24E",
        bg_color: "#F5EFE6",
        logo_url: null,
        font_family: "Geist"
      },
      isLoading: false,

      // Initial Mock Data
      mockSpaces: INITIAL_SPACES,
      mockTickets: [],
      mockSOS: [],

      setUser: (user) => set({ user }),
      setOrganization: (organization) => 
        set({ 
          organization, 
          branding: organization?.branding_config ?? null 
        }),
      setBranding: (branding) => set({ branding }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, organization: null, branding: null }),

      // Simulation Actions
      updateMockSpace: (id, status) => set((state) => ({
        mockSpaces: state.mockSpaces.map(s => s.id === id ? { ...s, status } : s)
      })),
      updateMockTicket: (id, status) => set((state) => ({
        mockTickets: state.mockTickets.map(t => t.id === id ? { ...t, status } : t)
      })),
      addMockSOS: (sos) => set((state) => ({
        mockSOS: [sos, ...state.mockSOS]
      })),
    }),
    {
      name: 'awake-user-storage',
      partialize: (state) => ({ 
        user: state.user, 
        organization: state.organization,
        branding: state.branding,
        mockSpaces: state.mockSpaces,
        mockTickets: state.mockTickets,
        mockSOS: state.mockSOS
      }),
    }
  )
);
