import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://mhggxwmgizpdpeywlobk.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_U4MhMvkKdPHEhsSblRh7kg_aZ0rg5bR';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
};

export const getSupabaseConfig = () => {
  return {
    url: SUPABASE_URL,
    key: SUPABASE_ANON_KEY,
  };
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
