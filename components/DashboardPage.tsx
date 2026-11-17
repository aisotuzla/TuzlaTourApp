import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Language } from '../types';
import {
  Activity, Award, CheckCircle2, Clock3, Crown, Gauge, Loader2,
  LogOut, Mail, MapPinned, Medal, ShieldCheck, Sparkles, Trophy, Users
} from 'lucide-react';

type DashboardPageProps = { lang: Language };
type RpcResult<T> = { data: T | null; error: { message: string } | null };
type RpcClient = { rpc: (name: string, args?: Record<string, unknown>) => Promise<RpcResult<unknown>> };
const rpc = supabase as unknown as RpcClient;

type PlayerDashboard = {
  profile?: { display_name?: string | null; leaderboard_opt_in?: boolean };
  xp_total?: number;
  level?: number;
  level_title?: string;
  next_level_xp?: number | null;
  xp_into_level?: number;
  xp_for_level?: number;
  quests_completed?: number;
  completed_quests?: Array<{ quest_id: string; title: Record<string, string> | string; phase: number; xp_awarded: number; completed_at: string }>;
  achievements?: Array<{ id: string; title: Record<string, string> | string; description: Record<string, string> | string; icon: string; unlocked_at: string }>;
  recent_xp?: Array<{ amount: number; reason: string; description?: string; created_at: string }>;
};
type AdminDashboard = {
  players_total: number;
  quests_total: number;
  quests_active: number;
  completions_total: number;
  xp_awarded_total: number;
  players_active_30d: number;
  top_players: Array<{ display_name: string; xp_total: number; level: number; quests_completed: number }>;
  recent_completions: Array<{ display_name: string; quest_id: string; title: Record<string, string> | string; xp_awarded: number; completed_at: string }>;
  recent_verification_attempts: Array<{ quest_id: string; method: string; succeeded: boolean; failure_reason?: string; distance_meters?: number; created_at: string }>;
};
type QuestConfig = { id: string; title: Record<string, string> | string; phase: number; qr_configured: boolean; gps_required: boolean; radius_meters: number; xp_reward: number; is_active: boolean };
type LeaderboardRow = { player_rank: number; display_name: string; xp_total: number; player_level: number; quests_completed: number };

const textFor = (value: Record<string, string> | string | undefined, lang: Language) => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[lang] || value.en || value.bs || Object.values(value)[0] || '';
};
const dateLabel = (value: string, lang: Language) => new Intl.DateTimeFormat(lang === 'bs' ? 'bs-BA' : lang, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
const numberLabel = (value: number | undefined) => (value ?? 0).toLocaleString();

const DashboardPage: React.FC<DashboardPageProps> = ({ lang }) => {
  const isBs = lang === 'bs';
  const [session, setSession] = useState<{ user: { id: string; email?: string } } | null>(null);
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [player, setPlayer] = useState<PlayerDashboard | null>(null);
  const [admin, setAdmin] = useState<AdminDashboard | null>(null);
  const [quests, setQuests] = useState<QuestConfig[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [activeView, setActiveView] = useState<'player' | 'admin'>('player');

  const copy = useMemo(() => isBs ? {
    title: 'Moj istraživački profil', subtitle: 'Pratite XP, nivoe, završene zadatke i značke.',
    email: 'Email adresa', send: 'Pošalji prijavni link', sending: 'Šaljem link…',
    sent: 'Prijavni link je poslan. Provjerite email i otvorite link na ovom uređaju.',
    signIn: 'Prijavite se da vidite svoj napredak', signOut: 'Odjava',
    player: 'Igrač', admin: 'Administrator', xp: 'Ukupno XP', level: 'Nivo', quests: 'Završeni zadaci',
    progress: 'Napredak do sljedećeg nivoa', achievements: 'Otključane značke',
    history: 'Nedavne XP aktivnosti', leaderboard: 'Rang lista', rank: 'Rang',
    noData: 'Još nema aktivnosti. Skenirajte QR kod na lokaciji i osvojite prve XP bodove.',
    adminTitle: 'Administratorska kontrolna tabla', overview: 'Pregled sistema',
    players: 'Igrači', totalQuests: 'Ukupno zadataka', activeQuests: 'Aktivni zadaci',
    completions: 'Završetci', xpAwarded: 'Dodijeljeni XP', active30: 'Aktivni igrači (30 dana)',
    topPlayers: 'Najbolji igrači', recentCompletions: 'Nedavni završeci', verifications: 'Provjere QR/GPS',
    questSetup: 'Konfiguracija zadataka', qrReady: 'QR postavljen', qrMissing: 'QR nedostaje',
    gps: 'GPS provjera', noAdmin: 'Administratorski pristup nije omogućen za ovaj račun.',
    failed: 'Nije moguće učitati podatke. Pokušajte ponovo.', retry: 'Pokušaj ponovo',
    empty: 'Nema podataka za prikaz.', success: 'Uspješno', failedStatus: 'Neuspješno',
    phase: 'Faza', radius: 'Radijus', reward: 'Nagrada'
  } : {
    title: 'My Explorer Dashboard', subtitle: 'Track your XP, levels, completed quests and achievements.',
    email: 'Email address', send: 'Send sign-in link', sending: 'Sending link…',
    sent: 'Sign-in link sent. Check your email and open the link on this device.',
    signIn: 'Sign in to see your progress', signOut: 'Sign out',
    player: 'Player', admin: 'Admin', xp: 'Total XP', level: 'Level', quests: 'Quests completed',
    progress: 'Progress to next level', achievements: 'Unlocked achievements',
    history: 'Recent XP activity', leaderboard: 'Leaderboard', rank: 'Rank',
    noData: 'No activity yet. Scan a QR code at a quest location to earn your first XP.',
    adminTitle: 'Admin Control Center', overview: 'System overview',
    players: 'Players', totalQuests: 'Total quests', activeQuests: 'Active quests',
    completions: 'Completions', xpAwarded: 'XP awarded', active30: 'Active players (30 days)',
    topPlayers: 'Top players', recentCompletions: 'Recent completions', verifications: 'QR/GPS verifications',
    questSetup: 'Quest configuration', qrReady: 'QR configured', qrMissing: 'QR missing',
    gps: 'GPS verification', noAdmin: 'Administrator access is not enabled for this account.',
    failed: 'Unable to load dashboard data. Please try again.', retry: 'Try again',
    empty: 'Nothing to show yet.', success: 'Success', failedStatus: 'Failed',
    phase: 'Phase', radius: 'Radius', reward: 'Reward'
  }, [isBs]);

  const loadDashboard = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setNotice('');
    const [playerResult, boardResult, adminResult] = await Promise.all([
      rpc.rpc('get_my_tuzla_dashboard'),
      rpc.rpc('get_tuzla_leaderboard', { p_limit: 10 }),
      rpc.rpc('get_tuzla_admin_dashboard', { p_recent_limit: 12 })
    ]);
    if (playerResult.error) {
      setNotice(playerResult.error.message || copy.failed);
      setLoading(false);
      return;
    }
    setPlayer(playerResult.data as PlayerDashboard);
    setLeaderboard((boardResult.data || []) as LeaderboardRow[]);
    if (!adminResult.error && adminResult.data) {
      setAdmin(adminResult.data as AdminDashboard);
      const questResult = await rpc.rpc('admin_get_tuzla_quest_config');
      setQuests((questResult.data || []) as QuestConfig[]);
    } else {
      setAdmin(null);
      setQuests([]);
      if (activeView === 'admin') setActiveView('player');
    }
    setLoading(false);
  }, [session, copy.failed, activeView]);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setSession(data.session ? { user: { id: data.session.user.id, email: data.session.user.email } } : null);
    }).catch(() => { if (alive) setNotice(copy.failed); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ? { user: { id: nextSession.user.id, email: nextSession.user.email } } : null);
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, [copy.failed]);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const sendMagicLink = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setNotice('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/dashboard` }
    });
    setNotice(error ? error.message : copy.sent);
    setSending(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setPlayer(null);
    setAdmin(null);
    setActiveView('player');
  };

  const StatCard = ({ icon: Icon, label, value, detail }: { icon: React.ElementType; label: string; value: string; detail?: string }) => (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-900">{value}</p>{detail && <p className="mt-1 text-xs text-slate-500">{detail}</p>}</div>
        <div className="rounded-xl bg-blue-50 p-3 text-blue-700"><Icon className="h-5 w-5" /></div>
      </div>
    </div>
  );

  return (
    <section className="min-h-full bg-slate-50 px-4 pb-10 pt-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-800"><Sparkles className="h-3.5 w-3.5" /> Tuzla Explorer Club</div>
            <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{copy.title}</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">{copy.subtitle}</p>
          </div>
          {session && <button onClick={signOut} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100"><LogOut className="h-4 w-4" />{copy.signOut}</button>}
        </div>

        {!session ? (
          <div className="mx-auto max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-lg sm:p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-900 text-white"><Trophy className="h-7 w-7" /></div>
            <h2 className="text-xl font-black text-slate-900">{copy.signIn}</h2>
            <form onSubmit={sendMagicLink} className="mt-5 space-y-3">
              <label className="block text-sm font-bold text-slate-700">{copy.email}</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
              <button disabled={sending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-4 py-3 font-black text-white shadow-md transition hover:bg-blue-800 disabled:opacity-60">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}{sending ? copy.sending : copy.send}</button>
            </form>
            {notice && <p className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{notice}</p>}
          </div>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3">
              <div className="text-sm text-slate-600"><span className="font-bold text-slate-900">{session.user.email}</span></div>
              <div className="flex gap-2">
                <button onClick={() => setActiveView('player')} className={`rounded-xl px-4 py-2 text-sm font-black transition ${activeView === 'player' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{copy.player}</button>
                {admin && <button onClick={() => setActiveView('admin')} className={`rounded-xl px-4 py-2 text-sm font-black transition ${activeView === 'admin' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}><ShieldCheck className="mr-1 inline h-4 w-4" />{copy.admin}</button>}
              </div>
            </div>
            {notice && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{notice}<button onClick={() => void loadDashboard()} className="ml-3 font-black underline">{copy.retry}</button></div>}
            {loading ? <div className="flex items-center justify-center gap-3 rounded-2xl bg-white p-12 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /> Loading dashboard…</div> : activeView === 'admin' && admin ? (
              <div className="space-y-6">
                <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-blue-800 p-6 text-white shadow-lg">
                  <div className="flex items-center gap-2 text-amber-300"><ShieldCheck className="h-5 w-5" /><span className="text-xs font-black uppercase tracking-[0.2em]">{copy.overview}</span></div>
                  <h2 className="mt-2 text-2xl font-black">{copy.adminTitle}</h2>
                  <p className="mt-1 text-sm text-blue-100">Live data from the Tuzla Tour Guide database</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <StatCard icon={Users} label={copy.players} value={numberLabel(admin.players_total)} />
                  <StatCard icon={MapPinned} label={copy.totalQuests} value={numberLabel(admin.quests_total)} detail={`${numberLabel(admin.quests_active)} ${copy.activeQuests.toLowerCase()}`} />
                  <StatCard icon={CheckCircle2} label={copy.completions} value={numberLabel(admin.completions_total)} />
                  <StatCard icon={Sparkles} label={copy.xpAwarded} value={numberLabel(admin.xp_awarded_total)} />
                  <StatCard icon={Activity} label={copy.active30} value={numberLabel(admin.players_active_30d)} />
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900"><Crown className="h-5 w-5 text-amber-500" />{copy.topPlayers}</h3>
                    <div className="space-y-3">{admin.top_players?.length ? admin.top_players.map((p, i) => <div key={p.display_name + i} className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-0"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-800">{i + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{p.display_name}</p><p className="text-xs text-slate-500">Level {p.level} · {p.quests_completed} quests</p></div><span className="font-black text-blue-900">{numberLabel(p.xp_total)} XP</span></div>) : <p className="text-sm text-slate-500">{copy.empty}</p>}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900"><MapPinned className="h-5 w-5 text-blue-700" />{copy.questSetup}</h3>
                    <div className="max-h-80 space-y-3 overflow-y-auto">{quests.length ? quests.map(q => <div key={q.id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"><div className="min-w-0"><p className="text-sm font-bold text-slate-900">{textFor(q.title, lang) || q.id}</p><p className="mt-1 text-xs text-slate-500">{copy.phase} {q.phase} · {q.radius_meters}m {copy.radius.toLowerCase()} · {q.xp_reward} XP</p></div><div className="shrink-0 text-right"><span className={`rounded-full px-2 py-1 text-[10px] font-black ${q.qr_configured ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{q.qr_configured ? copy.qrReady : copy.qrMissing}</span>{q.gps_required && <p className="mt-1 text-[10px] font-bold text-blue-700">{copy.gps}</p>}</div></div>) : <p className="text-sm text-slate-500">{copy.empty}</p>}</div>
                  </div>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-4 font-black text-slate-900">{copy.recentCompletions}</h3>
                    <div className="space-y-3">{admin.recent_completions?.length ? admin.recent_completions.map((c, i) => <div key={c.quest_id + c.completed_at + i} className="border-b border-slate-100 pb-3 last:border-0"><div className="flex justify-between gap-2"><p className="text-sm font-bold text-slate-900">{c.display_name || 'Explorer'}</p><span className="text-xs font-black text-emerald-700">+{c.xp_awarded} XP</span></div><p className="text-xs text-slate-500">{textFor(c.title, lang) || c.quest_id} · {dateLabel(c.completed_at, lang)}</p></div>) : <p className="text-sm text-slate-500">{copy.empty}</p>}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-4 font-black text-slate-900">{copy.verifications}</h3>
                    <div className="space-y-3">{admin.recent_verification_attempts?.length ? admin.recent_verification_attempts.map((v, i) => <div key={v.quest_id + v.created_at + i} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"><div><p className="text-sm font-bold text-slate-900">{v.quest_id || 'Unknown quest'} · {v.method.toUpperCase()}</p><p className="text-xs text-slate-500">{v.failure_reason || dateLabel(v.created_at, lang)}{v.distance_meters != null ? ` · ${Math.round(v.distance_meters)}m` : ''}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-black ${v.succeeded ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>{v.succeeded ? copy.success : copy.failedStatus}</span></div>) : <p className="text-sm text-slate-500">{copy.empty}</p>}</div>
                  </div>
                </div>
              </div>
            ) : player ? (
              <div className="space-y-6">
                <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-800 p-6 text-white shadow-xl sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div><p className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Tuzla Explorer</p><h2 className="mt-2 text-3xl font-black">{player.profile?.display_name || session.user.email?.split('@')[0] || 'Explorer'}</h2><p className="mt-1 text-sm text-blue-100">{player.level_title || `Level ${player.level || 1}`}</p></div>
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-right backdrop-blur"><p className="text-xs font-bold uppercase tracking-wider text-blue-100">{copy.xp}</p><p className="text-3xl font-black text-amber-300">{numberLabel(player.xp_total)}</p></div>
                  </div>
                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold uppercase text-blue-100">{copy.level}</p><p className="mt-1 text-2xl font-black">{player.level || 1}</p></div>
                    <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold uppercase text-blue-100">{copy.quests}</p><p className="mt-1 text-2xl font-black">{numberLabel(player.quests_completed)}</p></div>
                    <div className="rounded-2xl bg-white/10 p-4"><p className="text-xs font-bold uppercase text-blue-100">{copy.achievements}</p><p className="mt-1 text-2xl font-black">{numberLabel(player.achievements?.length)}</p></div>
                  </div>
                  {player.next_level_xp != null && <div className="mt-6"><div className="mb-2 flex justify-between text-xs font-bold text-blue-100"><span>{copy.progress}</span><span>{numberLabel(player.xp_into_level)} / {numberLabel(player.xp_for_level)} XP</span></div><div className="h-3 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-400" style={{ width: `${Math.min(100, Math.max(0, ((player.xp_into_level || 0) / Math.max(1, player.xp_for_level || 1)) * 100))}%` }} /></div></div>}
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900"><Award className="h-5 w-5 text-amber-500" />{copy.achievements}</h3>
                    <div className="grid grid-cols-2 gap-3">{player.achievements?.length ? player.achievements.map(a => <div key={a.id} className="rounded-xl bg-amber-50 p-3"><span className="text-2xl">{a.icon || '🏆'}</span><p className="mt-2 text-sm font-black text-slate-900">{textFor(a.title, lang)}</p><p className="mt-1 text-xs text-slate-600">{textFor(a.description, lang)}</p></div>) : <p className="col-span-2 text-sm text-slate-500">{copy.noData}</p>}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900"><Clock3 className="h-5 w-5 text-blue-700" />{copy.history}</h3>
                    <div className="space-y-3">{player.recent_xp?.length ? player.recent_xp.map((x, i) => <div key={x.created_at + i} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"><div><p className="text-sm font-bold text-slate-900">{x.description || x.reason.replaceAll('_', ' ')}</p><p className="text-xs text-slate-500">{dateLabel(x.created_at, lang)}</p></div><span className="font-black text-emerald-700">+{x.amount} XP</span></div>) : <p className="text-sm text-slate-500">{copy.noData}</p>}</div>
                  </div>
                </div>
                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900"><CheckCircle2 className="h-5 w-5 text-emerald-600" />{copy.quests}</h3>
                    <div className="space-y-3">{player.completed_quests?.length ? player.completed_quests.map(q => <div key={q.quest_id} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0"><div><p className="text-sm font-bold text-slate-900">{textFor(q.title, lang) || q.quest_id}</p><p className="text-xs text-slate-500">{copy.phase} {q.phase} · {dateLabel(q.completed_at, lang)}</p></div><span className="font-black text-emerald-700">+{q.xp_awarded} XP</span></div>) : <p className="text-sm text-slate-500">{copy.noData}</p>}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <h3 className="mb-4 flex items-center gap-2 font-black text-slate-900"><Medal className="h-5 w-5 text-amber-500" />{copy.leaderboard}</h3>
                    <div className="space-y-3">{leaderboard.length ? leaderboard.map(row => <div key={row.player_rank + row.display_name} className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-0"><span className="w-7 text-center text-sm font-black text-slate-500">#{row.player_rank}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-slate-900">{row.display_name}</p><p className="text-xs text-slate-500">Level {row.player_level} · {row.quests_completed} quests</p></div><span className="text-sm font-black text-blue-900">{numberLabel(row.xp_total)} XP</span></div>) : <p className="text-sm text-slate-500">{copy.empty}</p>}</div>
                  </div>
                </div>
              </div>
            ) : <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">{copy.failed}</div>}
          </>
        )}
      </div>
    </section>
  );
};

export default DashboardPage;
