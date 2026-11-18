import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const DEFAULT_SUPABASE_URL = 'https://czfoblgsqrrccoibboca.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_oM8ZtbnmFB8OF_MBjCoC-g_Sw_JZszA';

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  DEFAULT_SUPABASE_URL;

const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey
);
