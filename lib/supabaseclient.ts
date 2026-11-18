import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const DEFAULT_SUPABASE_URL = 'https://czfoblgsqrrccoibboca.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ZP6Ka_zfOvc2ZsnopOfKfA_sph7-Wlu';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  console.error('[Supabase] Missing Supabase configuration.');
}

export const supabase = createClient<Database>(
  supabaseUrl || DEFAULT_SUPABASE_URL,
  supabasePublishableKey || DEFAULT_SUPABASE_PUBLISHABLE_KEY
);
