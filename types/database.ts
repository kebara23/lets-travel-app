export type UserRole =
  | 'guest_short'
  | 'guest_long'
  | 'tribe'
  | 'staff_harmony'
  | 'staff_regeneration'
  | 'admin_guardian';

export interface BrandingConfig {
  primaryColor: string;
  accentColor: string;
}

export interface Organization {
  id: string;
  name: string;
  branding_config: any;
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
  is_event_leader: boolean; // Dynamic Permission
  created_at: string;
}

export interface Space {
  id: string;
  organization_id: string;
  name: string;
  type: string;
  status: 'clean' | 'dirty' | 'maintenance' | 'cleaning' | 'ready';
  assigned_staff_id: string | null;
  features: string[];
  created_at: string;
}

export interface Ticket {
  id: string;
  organization_id: string;
  space_id: string;
  creator_id: string;
  assigned_to: string | null;
  type: 'maintenance' | 'service';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  image_url: string | null;
  created_at: string;
}

export interface SOSAlert {
  id: string;
  user_id: string;
  organization_id: string;
  location: string;
  status: 'active' | 'resolved';
  created_at: string;
}
