import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { Database } from '../lib/supabase.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserPreferences = Database['public']['Tables']['user_preferences']['Row'];

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const updateProfile = async (updates: Record<string, any>) => {
    if (!user) return { error: new Error('No user') };

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return { error };
    }

    setProfile(data as Profile);
    return { data };
  };

  return { profile, loading, updateProfile };
}

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }

    async function fetchPreferences() {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching preferences:', error);
      } else {
        setPreferences(data);
      }
      setLoading(false);
    }

    fetchPreferences();
  }, [user]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating preferences:', error);
      return { error };
    }

    setPreferences(data);
    return { data };
  };

  return { preferences, loading, updatePreferences };
}

export function useRole() {
  const { profile, loading } = useProfile();

  return {
    role: profile?.role || 'user',
    isAdmin: profile?.role === 'admin',
    isSupport: profile?.role === 'support',
    loading,
  };
}
