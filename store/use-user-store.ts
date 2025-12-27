import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, Organization, BrandingConfig } from '../types/database';

interface UserState {
  user: UserProfile | null;
  organization: Organization | null;
  branding: BrandingConfig | null;
  isLoading: boolean;
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setOrganization: (org: Organization | null) => void;
  setBranding: (branding: BrandingConfig | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      organization: null,
      branding: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setOrganization: (organization) => 
        set({ 
          organization, 
          branding: organization?.branding_config ?? null 
        }),
      setBranding: (branding) => set({ branding }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, organization: null, branding: null }),
    }),
    {
      name: 'awake-user-storage',
      // Only persist user and basic org info, avoid persisting UI loading states
      partialize: (state) => ({ 
        user: state.user, 
        organization: state.organization,
        branding: state.branding
      }),
    }
  )
);


