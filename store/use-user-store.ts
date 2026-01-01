import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, Organization, Space, Ticket, SOSAlert } from '../types/database';

export interface ItineraryItem {
  id: string;
  title: string;
  type: string;
  time: string;
  completed: boolean;
  icon?: string;
  facilitator_id?: string;
}

export interface TribeMission {
  id: string;
  title: string;
  description: string;
  slots: number;
  slots_filled: number;
  energy_value: string;
  status: 'open' | 'active' | 'completed';
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'ceremony' | 'emergency';
  created_at: string;
}

export const DUMMY_USER: UserProfile = {
  id: "dummy-soul-001",
  email: "soul@awake.cr",
  role: 'admin_guardian',
  organization_id: "org-awake-001",
  full_name: "Awake Soul",
  avatar_url: null,
  current_status: 'active',
  is_event_leader: true,
  created_at: new Date().toISOString(),
};

const MOCK_USERS: UserProfile[] = [
  { id: 'u1', email: 'elena@awake.cr', role: 'tribe', organization_id: 'org-awake-001', full_name: 'Elena Mystra', avatar_url: 'https://i.pravatar.cc/150?u=u1', current_status: 'active', is_event_leader: false, created_at: new Date().toISOString() },
  { id: 'u2', email: 'marcus@awake.cr', role: 'tribe', organization_id: 'org-awake-001', full_name: 'Marcus Flow', avatar_url: 'https://i.pravatar.cc/150?u=u2', current_status: 'active', is_event_leader: true, created_at: new Date().toISOString() },
  { id: 'u3', email: 'sara@awake.cr', role: 'guest_long', organization_id: 'org-awake-001', full_name: 'Sara Sun', avatar_url: 'https://i.pravatar.cc/150?u=u3', current_status: 'active', is_event_leader: false, created_at: new Date().toISOString() },
  { id: 'u4', email: 'indra@awake.cr', role: 'tribe', organization_id: 'org-awake-001', full_name: 'Indra Yoga', avatar_url: 'https://i.pravatar.cc/150?u=u4', current_status: 'active', is_event_leader: false, created_at: new Date().toISOString() },
];

interface UserState {
  user: UserProfile | null;
  organization: Organization | null;
  branding: any | null;
  isLoading: boolean;
  
  mockSpaces: Space[];
  mockTickets: Ticket[];
  mockSOS: SOSAlert[];
  mockItinerary: ItineraryItem[];
  mockTribeMissions: TribeMission[];
  mockAnnouncements: Announcement[];
  mockUsers: UserProfile[];

  setUser: (user: UserProfile | null) => void;
  setOrganization: (org: Organization | null) => void;
  setBranding: (branding: any | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;

  updateMockSpace: (id: string, status: Space['status']) => void;
  addMockTicket: (ticket: Ticket) => void;
  updateMockTicket: (id: string, status: Ticket['status']) => void;
  addMockSOS: (sos: SOSAlert) => void;
  updateMockSOS: (id: string, status: SOSAlert['status']) => void;
  
  addItineraryItem: (item: ItineraryItem) => void;
  removeItineraryItem: (id: string) => void;
  toggleItineraryItem: (id: string) => void;

  addTribeMission: (mission: TribeMission) => void;
  updateTribeMission: (id: string, updates: Partial<TribeMission>) => void;

  addAnnouncement: (announcement: Announcement) => void;
  removeAnnouncement: (id: string) => void;

  toggleEventLeader: (userId: string) => void;
}

const FULL_INVENTORY: Space[] = [
  { id: 'oasis', organization_id: 'org-awake-001', name: 'Casa Oasis', type: 'HOUSE', status: 'dirty', features: ['Kitchen', 'Jacuzzi', 'Laundry'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'east-river', organization_id: 'org-awake-001', name: 'East River House', type: 'HOUSE', status: 'clean', features: ['Kitchen', 'Jacuzzi'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'ananda', organization_id: 'org-awake-001', name: 'Ananda Bus', type: 'BUS', status: 'cleaning', features: ['Deck', 'Kitchen'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'shakti', organization_id: 'org-awake-001', name: 'Shakti Bus', type: 'BUS', status: 'dirty', features: ['Deck', 'Kitchen'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'river-1', organization_id: 'org-awake-001', name: 'River Casita 1', type: 'CASITA', status: 'clean', features: ['River Front'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'river-2', organization_id: 'org-awake-001', name: 'River Casita 2', type: 'CASITA', status: 'dirty', features: ['River Front'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'garden-suite-a', organization_id: 'org-awake-001', name: 'Garden Suite A', type: 'SUITE', status: 'clean', features: ['Shared Wall'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'garden-suite-b', organization_id: 'org-awake-001', name: 'Garden Suite B', type: 'SUITE', status: 'maintenance', features: ['Shared Wall'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'garden-1', organization_id: 'org-awake-001', name: 'Garden Casita 1', type: 'CASITA', status: 'clean', features: ['Garden'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'garden-2', organization_id: 'org-awake-001', name: 'Garden Casita 2', type: 'CASITA', status: 'dirty', features: ['Garden'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'garden-3', organization_id: 'org-awake-001', name: 'Garden Casita 3', type: 'CASITA', status: 'clean', features: ['Garden'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'cora-1', organization_id: 'org-awake-001', name: 'Casa Cora 1', type: 'ROOM', status: 'dirty', features: ['Shared Bath'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'cora-2', organization_id: 'org-awake-001', name: 'Casa Cora 2', type: 'ROOM', status: 'dirty', features: ['Shared Bath'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'cora-3', organization_id: 'org-awake-001', name: 'Casa Cora 3', type: 'ROOM', status: 'clean', features: ['Shared Bath'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'cora-4', organization_id: 'org-awake-001', name: 'Casa Cora 4', type: 'ROOM', status: 'clean', features: ['Shared Bath'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'cora-5', organization_id: 'org-awake-001', name: 'Casa Cora 5', type: 'ROOM', status: 'cleaning', features: ['Shared Bath'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'cora-6', organization_id: 'org-awake-001', name: 'Casa Cora 6', type: 'ROOM', status: 'clean', features: ['Shared Bath'], assigned_staff_id: null, created_at: new Date().toISOString() },
  { id: 'cora-7', organization_id: 'org-awake-001', name: 'Casa Cora 7', type: 'ROOM', status: 'dirty', features: ['Shared Bath'], assigned_staff_id: null, created_at: new Date().toISOString() },
];

const INITIAL_TICKETS: Ticket[] = [
  { id: 'T1', organization_id: 'org-awake-001', space_id: 'oasis', creator_id: 'staff-1', assigned_to: null, type: 'maintenance', title: 'AC Filter Reset', description: 'AC unit in the living area is showing a red light, needs filter cleaning.', status: 'open', priority: 'high', created_at: new Date().toISOString(), image_url: null },
  { id: 'T2', organization_id: 'org-awake-001', space_id: 'shakti', creator_id: 'staff-2', assigned_to: null, type: 'maintenance', title: 'Loose Deck Plank', description: 'The wooden plank near the entrance of the Shakti bus is loose.', status: 'in_progress', priority: 'medium', created_at: new Date().toISOString(), image_url: null },
  { id: 'T3', organization_id: 'org-awake-001', space_id: 'river-1', creator_id: 'staff-1', assigned_to: null, type: 'maintenance', title: 'River Pump Noise', description: 'The water pump near the river casitas is making a high-pitched noise.', status: 'open', priority: 'low', created_at: new Date().toISOString(), image_url: null },
];

const INITIAL_TRIBE_MISSIONS: TribeMission[] = [
  { id: 'M1', title: 'Garden Sanctuary Help', description: 'We need help planting the new medicinal garden near Surya Shala.', slots: 5, slots_filled: 2, energy_value: '3 Hours', status: 'open', created_at: new Date().toISOString() },
  { id: 'M2', title: 'Beach Cleanse Flow', description: 'Collective walk and cleanup at Uvita beach. Let us honor the ocean.', slots: 10, slots_filled: 10, energy_value: '2 Hours', status: 'completed', created_at: new Date().toISOString() },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  { id: 'A1', title: 'New Healing Garden Open', content: 'Our medicinal herb sanctuary is now ready for silent meditation.', type: 'ceremony', created_at: new Date().toISOString() },
];

const INITIAL_ITINERARY: ItineraryItem[] = [
  { id: 'I1', title: 'Sunrise Yoga', type: 'Wellness', time: '06:00 AM', completed: false, icon: 'Wind' },
  { id: 'I2', title: 'Community Breakfast', type: 'Nourishment', time: '08:30 AM', completed: false, icon: 'Coffee' },
];

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      organization: { id: "org-awake-001", name: "Awake Uvita", branding_config: {}, created_at: "" },
      branding: { primaryColor: "#544356", accentColor: "#E09F6D" },
      isLoading: false,

      mockSpaces: FULL_INVENTORY,
      mockTickets: INITIAL_TICKETS,
      mockSOS: [],
      mockItinerary: INITIAL_ITINERARY,
      mockTribeMissions: INITIAL_TRIBE_MISSIONS,
      mockAnnouncements: INITIAL_ANNOUNCEMENTS,
      mockUsers: MOCK_USERS,

      setUser: (user) => set({ user }),
      setOrganization: (organization) => set({ organization }),
      setBranding: (branding) => set({ branding }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, organization: null, branding: null }),

      updateMockSpace: (id, status) => set((state) => ({
        mockSpaces: state.mockSpaces.map(s => s.id === id ? { ...s, status } : s)
      })),
      addMockTicket: (ticket) => set((state) => ({
        mockTickets: [ticket, ...state.mockTickets]
      })),
      updateMockTicket: (id, status) => set((state) => ({
        mockTickets: state.mockTickets.map(t => t.id === id ? { ...t, status } : t)
      })),
      addMockSOS: (sos) => set((state) => ({
        mockSOS: [sos, ...state.mockSOS]
      })),
      updateMockSOS: (id, status) => set((state) => ({
        mockSOS: state.mockSOS.map(s => s.id === id ? { ...s, status } : s)
      })),
      
      addItineraryItem: (item) => set((state) => ({
        mockItinerary: [...state.mockItinerary, item]
      })),
      removeItineraryItem: (id) => set((state) => ({
        mockItinerary: state.mockItinerary.filter(i => i.id !== id)
      })),
      toggleItineraryItem: (id) => set((state) => ({
        mockItinerary: state.mockItinerary.map(i => i.id === id ? { ...i, completed: !i.completed } : i)
      })),

      addTribeMission: (mission) => set((state) => ({
        mockTribeMissions: [mission, ...state.mockTribeMissions]
      })),
      updateTribeMission: (id, updates) => set((state) => ({
        mockTribeMissions: state.mockTribeMissions.map(m => m.id === id ? { ...m, ...updates } : m)
      })),

      addAnnouncement: (announcement) => set((state) => ({
        mockAnnouncements: [announcement, ...state.mockAnnouncements]
      })),
      removeAnnouncement: (id) => set((state) => ({
        mockAnnouncements: state.mockAnnouncements.filter(a => a.id !== id)
      })),

      toggleEventLeader: (userId) => set((state) => ({
        mockUsers: state.mockUsers.map(u => u.id === userId ? { ...u, is_event_leader: !u.is_event_leader } : u)
      })),
    }),
    { name: 'awake-user-storage-v6' }
  )
);
