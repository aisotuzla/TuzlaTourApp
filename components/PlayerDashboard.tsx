import React, { useCallback, useEffect, useState } from 'react';
import { Award, CheckCircle2, CircleAlert, Crown, LoaderCircle, RefreshCw, Target, Zap } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Language } from '../types';

type DashboardData = {
  profile?: { display_name?: string | null; leaderboard_opt_in?: boolean };
  xp_total?: number;
  level?: number;
  level_title?: string;
  next_level_xp?: number | null;
  xp_into_level?: number;
  xp_for_level?: number;
  quests_completed?: number;
  completed_quests?: Array<{ quest_id: string; title?: Record<string, string>; xp_awarded: number; completed_at: string }>;
  achievements?: Array<{ id: string; title: string | Record<string, string>; description?: string | Record<string, string>; icon?: string; unlocked_at: string }>;
  recent_xp?: Array<{ amount: number; reason: string; description?: string; created_at: string }>;
};

const copy = {
  en: { title: 'Explorer Dashboard', subtitle: 'Your Tuzla quest journey', xp: 'Total XP', level: 'Level', quests: 'Quests', achievements: 'Achievements', recent: 'Recent XP', completed: 'Completed Locations', empty: 'Scan location QR codes to earn XP.', loading: 'Loading profile…', refresh: 'Refresh', guest: 'Guest Explorer', authTitle: 'Guest sign-in disabled', authBody: 'Enable Anonymous Sign-Ins in Supabase Authentication settings.', retry: 'Retry', next: 'Next level', noAchievements: 'Badges appear here as you complete quests.', noHistory: 'No XP earned yet.' },
  bs: { title: 'Istraživački panel', subtitle: 'Tvoje putovanje kroz Tuzlu', xp: 'Ukupno XP', level: 'Nivo', quests: 'Potrage', achievements: 'Postignuća', recent: 'Nedavni XP', completed: 'Otkrivene lokacije', empty: 'Skeniraj QR kodove lokacija za XP bodove.', loading: 'Učitavanje profila…', refresh: 'Osvježi', guest: 'Gost istraživač', authTitle: 'Gostujuća prijava nije uključena', authBody: 'Uključi Anonymous Sign-Ins u Supabase Authentication postavkama.', retry: 'Pokušaj ponovo', next: 'Sljedeći nivo', noAchievements: 'Bedževi se pojavljuju nakon završenih potraga.', noHistory: 'Još nema osvojenih XP bodova.' },
  de: { title: 'Entdecker-Dashboard', subtitle: 'Deine Reise durch Tuzla', xp: 'XP Gesamt', level: 'Level', quests: 'Quests', achievements: 'Erfolge', recent: 'Letzte XP', completed: 'Entdeckte Orte', empty: 'Scanne QR-Codes für XP-Punkte.', loading: 'Lade Profil…', refresh: 'Aktualisieren', guest: 'Gast-Entdecker', authTitle: 'Gast-Anmeldung deaktiviert', authBody: 'Aktiviere Anonymous Sign-Ins in Supabase Authentication.', retry: 'Erneut versuchen', next: 'Nächstes Level', noAchievements: 'Abzeichen erscheinen nach Quests.', noHistory: 'Noch keine XP gesammelt.' },
  tr: { title: 'Kaşif Paneli', subtitle: 'Tuzla yolculuğun', xp: 'Toplam XP', level: 'Seviye', quests: 'Görevler', achievements: 'Başarımlar', recent: 'Son XP', completed: 'Keşfedilen Yerler', empty: 'XP kazanmak için QR kodları tara.', loading: 'Profil yükleniyor…', refresh: 'Yenile', guest: 'Misafir Kaşif', authTitle: 'Misafir girişi kapalı', authBody: 'Supabase Authentication ayarlarından Anonymous Sign-Ins açın.', retry: 'Tekrar dene', next: 'Sonraki seviye', noAchievements: 'Rozetler görevlerle açılır.', noHistory: 'Henüz XP kazanılmadı.' }
};

const textFor = (value: unknown, lang: Language): string => {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, string>;
    return record[lang] || record.en || record.bs || '';
  }
  return '';
};

const PlayerDashboard: React.FC<{ lang: Language }> = ({ lang }) => {
  const t = copy[lang] || copy.en;
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guestId, setGuestId] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      let { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (!sessionData.session) {
        const { data: signInData, error: signInError } = await supabase.auth.signInAnonymously();
        if (signInError) throw signInError;
        sessionData = { session: signInData.session, user: signInData.user } as typeof sessionData;
      }

      if (!sessionData.session?.user) throw new Error('Guest session could not be created.');
      setGuestId(sessionData.session.user.id);

      const { data: dashboardData, error: dashboardError } = await (supabase as any).rpc('get_my_tuzla_dashboard');
      if (dashboardError) throw dashboardError;
      setData(dashboardData as DashboardData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to load your dashboard.';
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const progress = data?.xp_for_level ? Math.min(100, Math.max(0, ((data.xp_into_level || 0) / data.xp_for_level) * 100)) : 100;

  return (
    <section className="min-h-full w-full bg-slate-50 px-3 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-5">\n        {adminOpen ? <AdminDashboard lang={lang} onBack={() => setAdminOpen(false)} /> : <>
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-5 text-white shadow-xl sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-300"><Sparkles size={15} /> Tuzla Tour Guide</p>
              <h2 className="text-2xl font-black sm:text-3xl">{t.title}</h2>
              <p className="mt-1 max-w-xl text-sm text-blue-100">{t.subtitle}</p>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold"><Crown size={14} className="text-amber-300" /> {data?.profile?.display_name || t.guest}</p>
            </div>
            <div className="flex flex-wrap gap-2"><button onClick={() => setAdminOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-amber-300/50 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-300/20"><Crown size={14} /> Admin</button><button onClick={() => void loadDashboard()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 disabled:opacity-50"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {t.refresh}</button></div>
          </div>
          {guestId && <p className="mt-4 text-[10px] text-blue-200/70">Player ID: {guestId.slice(0, 8)}…</p>}
        </div>

        {loading ? (
          <div className="flex h-24 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white text-xs font-bold text-blue-800 shadow-xs">
            <LoaderCircle size={16} className="animate-spin" /> {t.loading}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950 text-xs shadow-xs">
            <div className="flex items-center gap-1.5 font-bold">
              <CircleAlert size={14} className="shrink-0 text-amber-600" />
              <span>{error.toLowerCase().includes('anonymous') || error.toLowerCase().includes('signup') ? t.authTitle : 'Dashboard unavailable'}</span>
            </div>
            <p className="mt-1 text-[11px] text-amber-900 leading-normal">{error.toLowerCase().includes('anonymous') || error.toLowerCase().includes('signup') ? t.authBody : error}</p>
            <button
              type="button"
              onClick={() => void loadDashboard()}
              className="mt-2 rounded-lg bg-blue-700 px-3 py-1 text-[11px] font-bold text-white active:scale-95"
            >
              {t.retry}
            </button>
          </div>
        ) : data && (
          <>
            {/* 3 Compact Stat Cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-center shadow-xs">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  <Zap size={11} className="text-amber-500" />
                  <span>{t.xp}</span>
                </div>
                <p className="mt-1 text-lg sm:text-xl font-black text-blue-950 leading-tight">
                  {(data.xp_total || 0).toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-center shadow-xs">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  <Target size={11} className="text-blue-500" />
                  <span>{t.level}</span>
                </div>
                <p className="mt-1 text-lg sm:text-xl font-black text-blue-950 leading-tight">
                  {data.level || 1}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 truncate">{data.level_title || ''}</p>
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 text-center shadow-xs">
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wide">
                  <CheckCircle2 size={11} className="text-emerald-500" />
                  <span>{t.quests}</span>
                </div>
                <p className="mt-1 text-lg sm:text-xl font-black text-blue-950 leading-tight">
                  {data.quests_completed || 0}<span className="text-xs font-normal text-slate-400">/12</span>
                </p>
              </div>
            </div>

            {/* Level Progress - Slim Bar */}
            <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 shadow-xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="text-[11px] text-slate-500">{t.next}</span>
                <span className="text-[11px] font-black text-amber-600">
                  {data.xp_into_level || 0} / {data.xp_for_level || 0} XP
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Achievements & Recent Activity side-by-side or stacked cleanly */}
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-black text-blue-950">
                  <Award className="text-amber-500" size={13} /> {t.achievements}
                </h3>
                {data.achievements?.length ? (
                  <div className="grid grid-cols-2 gap-1.5">
                    {data.achievements.map((badge) => (
                      <div key={badge.id} className="rounded-lg border border-amber-100 bg-amber-50/60 p-1.5 text-center">
                        <span className="text-base">{badge.icon || '🏅'}</span>
                        <p className="mt-0.5 text-[11px] font-bold text-blue-950 truncate">{textFor(badge.title, lang)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 py-1">{t.noAchievements}</p>
                )}
              </div>

              <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
                <h3 className="mb-2 flex items-center gap-1.5 text-xs font-black text-blue-950">
                  <Zap className="text-amber-500" size={13} /> {t.recent}
                </h3>
                {data.recent_xp?.length ? (
                  <div className="space-y-1.5">
                    {data.recent_xp.slice(0, 4).map((item, index) => (
                      <div key={`${item.created_at}-${index}`} className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1 last:border-0">
                        <p className="truncate text-[11px] font-semibold text-slate-700">{item.description || item.reason}</p>
                        <span className="shrink-0 text-[11px] font-black text-emerald-600">+{item.amount} XP</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 py-1">{t.noHistory}</p>
                )}
              </div>
            </div>

            {/* Completed Quests List */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-xs">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-black text-blue-950">
                <CheckCircle2 className="text-emerald-500" size={13} /> {t.completed}
              </h3>
              {data.completed_quests?.length ? (
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {data.completed_quests.map((quest) => (
                    <div key={quest.quest_id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2 py-1.5 border border-slate-100">
                      <p className="truncate text-[11px] font-bold text-slate-800">{textFor(quest.title, lang) || quest.quest_id}</p>
                      <span className="shrink-0 text-[10px] font-black text-emerald-600">+{quest.xp_awarded} XP</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 py-1">{t.empty}</p>
              )}
            </div>
          </>
        )}
      </>
        )}
      </div>
    </section>
  );
};

export default PlayerDashboard;
