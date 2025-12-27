export type UserRole =
  | 'guest_short'
  | 'guest_long'
  | 'tribe'
  | 'staff_harmony'
  | 'staff_regeneration'
  | 'admin_guardian';

export interface BrandingConfig {
  primary_color: string;
  accent_color: string;
  bg_color: string;
  logo_url: string | null;
  font_family: string;
}

export interface Organization {
  id: string;
  name: string;
  branding_config: BrandingConfig;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  organization_id: string | null;
  full_name: string | null;
  avatar_url: string | null;
  current_status: 'active' | 'checked_out';
  created_at: string;
}

export interface Space {
  id: string;
  organization_id: string;
  name: string;
  type: 'room' | 'common';
  status: 'clean' | 'dirty' | 'maintenance';
  assigned_staff_id: string | null;
  created_at: string;
}

export interface ItineraryItem {
  id: string;
  user_id: string;
  title: string;
  type: 'activity' | 'gastronomy' | 'wellness';
  start_time: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface Mission {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'done';
  date: string;
}

export interface Ticket {
  id: string;
  organization_id: string;
  creator_id: string;
  assigned_to: string | null;
  type: 'maintenance' | 'service';
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  image_url: string | null;
  created_at: string;
}

export interface SOSAlert {
  id: string;
  user_id: string;
  organization_id: string;
  lat: number;
  lng: number;
  status: 'active' | 'resolved';
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: Organization;
        Insert: Omit<Organization, 'id' | 'created_at'>;
        Update: Partial<Omit<Organization, 'id' | 'created_at'>>;
      };
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'created_at'>;
        Update: Partial<Omit<UserProfile, 'created_at'>>;
      };
      spaces: {
        Row: Space;
        Insert: Omit<Space, 'id' | 'created_at'>;
        Update: Partial<Omit<Space, 'id' | 'created_at'>>;
      };
      itinerary_items: {
        Row: ItineraryItem;
        Insert: Omit<ItineraryItem, 'id' | 'created_at'>;
        Update: Partial<Omit<ItineraryItem, 'id' | 'created_at'>>;
      };
      missions: {
        Row: Mission;
        Insert: Omit<Mission, 'id'>;
        Update: Partial<Omit<Mission, 'id'>>;
      };
      tickets: {
        Row: Ticket;
        Insert: Omit<Ticket, 'id' | 'created_at'>;
        Update: Partial<Omit<Ticket, 'id' | 'created_at'>>;
      };
      sos_alerts: {
        Row: SOSAlert;
        Insert: Omit<SOSAlert, 'id' | 'created_at'>;
        Update: Partial<Omit<SOSAlert, 'id' | 'created_at'>>;
      };
    };
  };
}


