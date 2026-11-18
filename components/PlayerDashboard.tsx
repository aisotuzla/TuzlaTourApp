import React, { useCallback, useEffect, useState } from 'react';
import { Award, CheckCircle2, CircleAlert, Crown, LoaderCircle, RefreshCw, Sparkles, Target, Trophy, Zap } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Language } from '../types';
import AdminDashboard from './AdminDashboard';

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
  en: { title: 'Explorer dashboard', subtitle: 'Your journey through Tuzla, all in one place.', xp: 'Total XP', level: 'Level', quests: 'Quests completed', achievements: 'Achievements', recent: 'Recent XP activity', completed: 'Completed locations', empty: 'Your adventure starts here. Scan a location QR code to earn your first XP.', loading: 'Preparing your explorer profile…', refresh: 'Refresh', guest: 'Guest explorer', authTitle: 'Guest sign-in is not enabled', authBody: 'Enable Anonymous Sign-Ins in Supabase Authentication settings, then reload this page. No email or password is needed.', retry: 'Try again', next: 'Next level', noAchievements: 'Your badges will appear here as you complete quests.', noHistory: 'No XP earned yet.' },
  bs: { title: 'Istraživački dashboard', subtitle: 'Tvoje putovanje kroz Tuzlu na jednom mjestu.', xp: 'Ukupno XP', level: 'Nivo', quests: 'Završene potrage', achievements: 'Postignuća', recent: 'Nedavna XP aktivnost', completed: 'Otkrivene lokacije', empty: 'Tvoja avantura počinje ovdje. Skeniraj QR kod lokacije i osvoji prve XP bodove.', loading: 'Pripremamo tvoj profil istraživača…', refresh: 'Osvježi', guest: 'Gost istraživač', authTitle: 'Gostujuća prijava nije uključena', authBody: 'Uključi Anonymous Sign-Ins u Supabase Authentication postavkama, zatim ponovo učitaj stranicu. E-mail i lozinka nisu potrebni.', retry: 'Pokušaj ponovo', next: 'Sljedeći nivo', noAchievements: 'Bedževi će se pojaviti ovdje kada završiš potrage.', noHistory: 'Još nema osvojenih XP bodova.' },
  de: { title: 'Entdecker-Dashboard', subtitle: 'Deine Reise durch Tuzla an einem Ort.', xp: 'XP insgesamt', level: 'Level', quests: 'Abgeschlossene Quests', achievements: 'Erfolge', recent: 'Letzte XP-Aktivität', completed: 'Entdeckte Orte', empty: 'Dein Abenteuer beginnt hier. Scanne den QR-Code eines Ortes und sammle deine ersten XP.', loading: 'Dein Entdeckerprofil wird vorbereitet…', refresh: 'Aktualisieren', guest: 'Gast-Entdecker', authTitle: 'Gast-Anmeldung ist nicht aktiviert', authBody: 'Aktiviere Anonymous Sign-Ins in den Supabase-Authentifizierungseinstellungen und lade diese Seite neu. E-Mail und Passwort sind nicht erforderlich.', retry: 'Erneut versuchen', next: 'Nächstes Level', noAchievements: 'Deine Abzeichen erscheinen hier, sobald du Quests abschließt.', noHistory: 'Noch keine XP gesammelt.' },
  tr: { title: 'Kaşif paneli', subtitle: 'Tuzla yolculuğun tek bir yerde.', xp: 'Toplam XP', level: 'Seviye', quests: 'Tamamlanan görevler', achievements: 'Başarımlar', recent: 'Son XP etkinliği', completed: 'Keşfedilen yerler', empty: 'Maceran burada başlıyor. İlk XP puanlarını kazanmak için bir konumun QR kodunu tara.', loading: 'Kaşif profilin hazırlanıyor…', refresh: 'Yenile', guest: 'Misafir kaşif', authTitle: 'Misafir girişi etkin değil', authBody: 'Supabase Authentication ayarlarında Anonymous Sign-Ins özelliğini etkinleştir ve bu sayfayı yenile. E-posta veya parola gerekmez.', retry: 'Tekrar dene', next: 'Sonraki seviye', noAchievements: 'Görevleri tamamladıkça rozetlerin burada görünecek.', noHistory: 'Henüz XP kazanılmadı.' }
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
  const [adminOpen, setAdminOpen] = useState(false);

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
            <div className="flex flex-wrap gap-2"><button onClick={() => setAdminOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-amber-300/50 bg-amber-300/10 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-amber-300/20"><Crown size={14}/> Admin</button><button onClick={() => void loadDashboard()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold hover:bg-white/20 disabled:opacity-50"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {t.refresh}</button></div>
          </div>
          {guestId && <p className="mt-4 text-[10px] text-blue-200/70">Player ID: {guestId.slice(0, 8)}…</p>}
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-white text-sm font-bold text-blue-800"><LoaderCircle className="animate-spin" /> {t.loading}</div>
        ) : error ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <div className="flex items-center gap-2 font-black"><CircleAlert size={18} /> {error.toLowerCase().includes('anonymous') || error.toLowerCase().includes('signup') ? t.authTitle : 'Dashboard unavailable'}</div>
            <p className="mt-2 text-sm leading-relaxed">{error.toLowerCase().includes('anonymous') || error.toLowerCase().includes('signup') ? t.authBody : error}</p>
            <button onClick={() => void loadDashboard()} className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-2 text-sm font-bold text-white">{t.retry}</button>
          </div>
        ) : data && (
          <>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-sm font-bold text-slate-500">{t.xp}<Zap size={18} className="text-amber-500" /></div><p className="mt-2 text-3xl font-black text-blue-900">{(data.xp_total || 0).toLocaleString()}</p><p className="text-xs text-slate-400">XP</p></div>
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-sm font-bold text-slate-500">{t.level}<Trophy size={18} className="text-amber-500" /></div><p className="mt-2 text-3xl font-black text-blue-900">{data.level || 1}</p><p className="text-xs font-semibold text-slate-500">{data.level_title || ''}</p></div>
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between text-sm font-bold text-slate-500">{t.quests}<Target size={18} className="text-amber-500" /></div><p className="mt-2 text-3xl font-black text-blue-900">{data.quests_completed || 0}<span className="text-base text-slate-400"> / 12</span></p><p className="text-xs text-slate-400">{t.completed}</p></div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3"><h3 className="font-black text-blue-950">{t.next}</h3><span className="text-xs font-black text-amber-600">{data.next_level_xp ? `${data.next_level_xp} XP` : 'MAX'}</span></div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-blue-100"><div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all" style={{ width: `${progress}%` }} /></div>
              <p className="mt-2 text-right text-xs font-semibold text-slate-500">{data.xp_into_level || 0} / {data.xp_for_level || 0} XP</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-black text-blue-950"><Award className="text-amber-500" size={19} /> {t.achievements}</h3>
                {data.achievements?.length ? <div className="grid grid-cols-2 gap-3">{data.achievements.map((badge) => <div key={badge.id} className="rounded-xl border border-amber-100 bg-amber-50/70 p-3"><div className="text-xl">{badge.icon || '🏅'}</div><p className="mt-1 text-sm font-black text-blue-950">{textFor(badge.title, lang)}</p><p className="mt-1 text-xs text-slate-500">{textFor(badge.description, lang)}</p></div>)}</div> : <p className="text-sm text-slate-500">{t.noAchievements}</p>}
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-black text-blue-950"><Zap className="text-amber-500" size={18} /> {t.recent}</h3>
                {data.recent_xp?.length ? <div className="space-y-3">{data.recent_xp.map((item, index) => <div key={`${item.created_at}-${index}`} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2 last:border-0"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{item.description || item.reason}</p><p className="text-[11px] text-slate-400">{new Date(item.created_at).toLocaleDateString(lang === 'bs' ? 'bs-BA' : lang === 'de' ? 'de-DE' : lang === 'tr' ? 'tr-TR' : 'en-US')}</p></div><span className="shrink-0 font-black text-emerald-600">+{item.amount} XP</span></div>)}</div> : <p className="text-sm text-slate-500">{t.noHistory}</p>}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
              <h3 className="mb-4 flex items-center gap-2 font-black text-blue-950"><CheckCircle2 className="text-emerald-500" size={19} /> {t.completed}</h3>
              {data.completed_quests?.length ? <div className="grid gap-2 sm:grid-cols-2">{data.completed_quests.map((quest) => <div key={quest.quest_id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{textFor(quest.title, lang) || quest.quest_id}</p><p className="text-xs text-slate-400">{new Date(quest.completed_at).toLocaleDateString()}</p></div><span className="shrink-0 text-xs font-black text-emerald-600">+{quest.xp_awarded} XP</span></div>)}</div> : <p className="text-sm text-slate-500">{t.empty}</p>}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default PlayerDashboard;
