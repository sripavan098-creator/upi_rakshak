export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          preferred_language: string;
          role: 'user' | 'admin' | 'support';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          preferred_language?: string;
          role?: 'user' | 'admin' | 'support';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          preferred_language?: string;
          role?: 'user' | 'admin' | 'support';
          created_at?: string;
          updated_at?: string;
        };
      };
      scans: {
        Row: {
          id: string;
          user_id: string;
          source: 'manual' | 'notification' | 'qr' | 'voice';
          original_text: string;
          threat_level: 'HIGH' | 'MEDIUM' | 'SAFE';
          reasons: Json;
          suggested_action: string | null;
          official_route: string | null;
          matched_patterns: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source: 'manual' | 'notification' | 'qr' | 'voice';
          original_text: string;
          threat_level: 'HIGH' | 'MEDIUM' | 'SAFE';
          reasons?: Json;
          suggested_action?: string | null;
          official_route?: string | null;
          matched_patterns?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source?: 'manual' | 'notification' | 'qr' | 'voice';
          original_text?: string;
          threat_level?: 'HIGH' | 'MEDIUM' | 'SAFE';
          reasons?: Json;
          suggested_action?: string | null;
          official_route?: string | null;
          matched_patterns?: Json;
          created_at?: string;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          voice_enabled: boolean;
          haptics_enabled: boolean;
          overlay_enabled: boolean;
          notification_monitoring: boolean;
          guardian_mode_enabled: boolean;
          guardian_contact_phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          voice_enabled?: boolean;
          haptics_enabled?: boolean;
          overlay_enabled?: boolean;
          notification_monitoring?: boolean;
          guardian_mode_enabled?: boolean;
          guardian_contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          voice_enabled?: boolean;
          haptics_enabled?: boolean;
          overlay_enabled?: boolean;
          notification_monitoring?: boolean;
          guardian_mode_enabled?: boolean;
          guardian_contact_phone?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      shared_reports: {
        Row: {
          id: string;
          scan_id: string;
          shared_by: string;
          shared_with_phone: string;
          status: 'pending' | 'approved' | 'rejected';
          created_at: string;
        };
        Insert: {
          id?: string;
          scan_id: string;
          shared_by: string;
          shared_with_phone: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
        Update: {
          id?: string;
          scan_id?: string;
          shared_by?: string;
          shared_with_phone?: string;
          status?: 'pending' | 'approved' | 'rejected';
          created_at?: string;
        };
      };
      cash_flow_snapshots: {
        Row: {
          id: string;
          user_id: string;
          runway_days: number;
          income: number;
          expenses: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          runway_days: number;
          income: number;
          expenses: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          runway_days?: number;
          income?: number;
          expenses?: number;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          metadata?: Json;
          created_at?: string;
        };
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
      threat_patterns: {
        Row: {
          id: string;
          name: string;
          category: string;
          regex: string | null;
          keywords: Json;
          threat_level: 'HIGH' | 'MEDIUM' | 'SAFE';
          enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category: string;
          regex?: string | null;
          keywords?: Json;
          threat_level: 'HIGH' | 'MEDIUM' | 'SAFE';
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string;
          regex?: string | null;
          keywords?: Json;
          threat_level?: 'HIGH' | 'MEDIUM' | 'SAFE';
          enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
