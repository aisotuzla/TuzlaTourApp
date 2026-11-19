import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

// Share one in-flight anonymous sign-in across app entry points. This prevents
// the map quest flow and player dashboard from creating competing guest users.
let pendingAnonymousSignIn: Promise<Session> | null = null;

export async function ensurePlayerSession(displayName?: string): Promise<Session> {
  const { data: current, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;
  if (current.session) {
    await ensurePlayerProfile(current.session, displayName);
    return current.session;
  }

  if (!pendingAnonymousSignIn) {
    pendingAnonymousSignIn = (async () => {
      const { data, error } = await supabase.auth.signInAnonymously({
        options: displayName ? { data: { display_name: displayName } } : undefined,
      });
      if (error) throw error;
      if (!data.session) throw new Error('anonymous_session_not_created');
      await ensurePlayerProfile(data.session, displayName);
      return data.session;
    })();
  }

  try {
    return await pendingAnonymousSignIn;
  } finally {
    pendingAnonymousSignIn = null;
  }
}

async function ensurePlayerProfile(session: Session, displayName?: string): Promise<void> {
  const { error } = await supabase.from('profiles').upsert(
    {
      id: session.user.id,
      display_name: displayName ?? 'Tuzla Explorer',
    },
    { onConflict: 'id', ignoreDuplicates: true }
  );
  if (error) throw error;
}
