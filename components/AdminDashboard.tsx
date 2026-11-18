import React, { useCallback, useEffect, useState } from 'react';
import { Activity, CheckCircle2, LogIn, LogOut, ShieldCheck, Users, Zap, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Language } from '../types';

type AdminData = {
  players_total: number; quests_total: number; quests_active: number;
  completions_total: number; xp_awarded_total: number; players_active_30d: number;
  top_players: Array<{id:string;display_name:string;xp_total:number;level:number;quests_completed:number}>;
  recent_completions: Array<{player_id:string;display_name:string;quest_id:string;title:Record<string,string>;xp_awarded:number;completed_at:string}>;
  recent_verification_attempts: Array<{player_id:string|null;quest_id:string|null;method:string;succeeded:boolean;failure_reason:string|null;distance_meters:number|null;created_at:string}>;
};
const labels = {
 en:{title:'Admin control room',intro:'Sign in with an administrator email to view live platform statistics.',email:'Administrator email',send:'Send secure sign-in link',sent:'Check your inbox for the secure sign-in link.',signOut:'Sign out',refresh:'Refresh',players:'Players',active:'Active players (30 days)',quests:'Active quests',completions:'Quest completions',xp:'XP awarded',top:'Top explorers',recent:'Recent completions',attempts:'Verification attempts',success:'Verified',failed:'Rejected',noData:'No activity recorded yet.',denied:'This account does not have administrator access.',loading:'Loading admin data…'},
 bs:{title:'Admin kontrolna tabla',intro:'Prijavi se administratorskom e-mail adresom za pregled statistike platforme.',email:'Admin e-mail',send:'Pošalji sigurni link',sent:'Provjeri e-mail za link za sigurnu prijavu.',signOut:'Odjavi se',refresh:'Osvježi',players:'Igrači',active:'Aktivni igrači (30 dana)',quests:'Aktivne potrage',completions:'Završene potrage',xp:'Dodijeljeni XP',top:'Najbolji istraživači',recent:'Nedavno završene potrage',attempts:'Pokušaji verifikacije',success:'Potvrđeno',failed:'Odbijeno',noData:'Još nema zabilježene aktivnosti.',denied:'Ovaj račun nema administratorski pristup.',loading:'Učitavanje admin podataka…'},
 de:{title:'Admin-Kontrollzentrum',intro:'Melde dich mit einer Administrator-E-Mail an, um aktuelle Statistiken zu sehen.',email:'Administrator-E-Mail',send:'Sicheren Anmeldelink senden',sent:'Prüfe deinen Posteingang.',signOut:'Abmelden',refresh:'Aktualisieren',players:'Spieler',active:'Aktive Spieler (30 Tage)',quests:'Aktive Quests',completions:'Quest-Abschlüsse',xp:'Vergebene XP',top:'Top-Entdecker',recent:'Letzte Abschlüsse',attempts:'Verifizierungsversuche',success:'Bestätigt',failed:'Abgelehnt',noData:'Noch keine Aktivitäten.',denied:'Dieses Konto hat keinen Administratorzugriff.',loading:'Admin-Daten werden geladen…'},
 tr:{title:'Yönetici kontrol paneli',intro:'Platform istatistiklerini görmek için yönetici e-postanla giriş yap.',email:'Yönetici e-postası',send:'Güvenli giriş bağlantısı gönder',sent:'Güvenli giriş bağlantısı için gelen kutunu kontrol et.',signOut:'Çıkış yap',refresh:'Yenile',players:'Oyuncular',active:'Aktif oyuncular (30 gün)',quests:'Aktif görevler',completions:'Tamamlanan görevler',xp:'Verilen XP',top:'En iyi kaşifler',recent:'Son tamamlanan görevler',attempts:'Doğrulama denemeleri',success:'Doğrulandı',failed:'Reddedildi',noData:'Henüz etkinlik kaydedilmedi.',denied:'Bu hesapta yönetici erişimi yok.',loading:'Yönetici verileri yükleniyor…'}
} as const;
const localize=(v:Record<string,string>|undefined,lang:Language)=>v?.[lang]||v?.en||v?.bs||'';
const AdminDashboard:React.FC<{lang:Language;onBack:()=>void}> = ({lang,onBack})=>{
 const t=labels[lang]||labels.en;
 const [email,setEmail]=useState(''); const [sent,setSent]=useState(false); const [busy,setBusy]=useState(false);
 const [session,setSession]=useState<any>(null); const [data,setData]=useState<AdminData|null>(null);
 const [error,setError]=useState(''); const [loading,setLoading]=useState(true);
 const load=useCallback(async()=>{
  setLoading(true);setError('');
  try{
   const {data:s}=await supabase.auth.getSession();setSession(s.session);
   if(!s.session || s.session.user.is_anonymous){setData(null);setLoading(false);return;}
   const {data:result,error:e}=await (supabase as any).rpc('get_tuzla_admin_dashboard',{p_recent_limit:20});
   if(e) throw e; setData(result as AdminData);
  }catch(e){setData(null);setError(e instanceof Error?e.message:t.denied);}
  finally{setLoading(false);}
 },[t.denied]);
 useEffect(()=>{void load();const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>{void load();});return()=>subscription.unsubscribe();},[load]);
 const sendLink=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');setSent(false);
  try{const {data:s}=await supabase.auth.getSession();if(s.session?.user.is_anonymous) await supabase.auth.signOut();
   const {error:e}=await supabase.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:window.location.origin+'/admin',shouldCreateUser:true}});
   if(e)throw e;setSent(true);
  }catch(e){setError(e instanceof Error?e.message:'Unable to send sign-in link.');}finally{setBusy(false);}
 };
 const signOut=async()=>{await supabase.auth.signOut();setData(null);setSession(null);};
 const date=(v:string)=>new Date(v).toLocaleString(lang==='bs'?'bs-BA':lang==='de'?'de-DE':lang==='tr'?'tr-TR':'en-GB');
 return <section className="space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-amber-500"><ShieldCheck size={15}/>{t.title}</p><p className="mt-1 text-sm text-slate-500">{t.intro}</p></div><button onClick={onBack} className="rounded-xl border border-blue-200 px-3 py-2 text-xs font-bold text-blue-800">← Dashboard</button></div>
  {!session?.user || session.user.is_anonymous ? <form onSubmit={sendLink} className="max-w-xl rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><label className="text-sm font-bold text-slate-700">{t.email}</label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com" className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"/><button disabled={busy} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2 text-sm font-black text-blue-950 disabled:opacity-50"><LogIn size={15}/>{busy?'…':t.send}</button></div>{sent&&<p className="mt-3 text-sm text-emerald-700">{t.sent}</p>}{error&&<p className="mt-3 text-sm text-rose-600">{error}</p>}</form> :
  <><div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3"><p className="text-xs font-bold text-emerald-800">{session.user.email}</p><div className="flex gap-2"><button onClick={()=>void load()} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-900"><RefreshCw size={13}/>{t.refresh}</button><button onClick={()=>void signOut()} className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 px-3 py-2 text-xs font-bold text-emerald-900"><LogOut size={13}/>{t.signOut}</button></div></div>
  {loading?<p className="rounded-xl bg-white p-5 text-sm text-slate-500">{t.loading}</p>:error?<p className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">{error.includes('Administrator')?t.denied:error}</p>:data&&<>
   <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{[{label:t.players,value:data.players_total,icon:Users},{label:t.active,value:data.players_active_30d,icon:Activity},{label:t.quests,value:data.quests_active,icon:CheckCircle2},{label:t.completions,value:data.completions_total,icon:CheckCircle2},{label:t.xp,value:(data.xp_awarded_total||0).toLocaleString(),icon:Zap}].map((x,i)=><div key={i} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm"><x.icon size={18} className="mb-3 text-amber-500"/><p className="text-[11px] font-bold text-slate-500">{x.label}</p><p className="mt-1 text-2xl font-black text-blue-950">{x.value}</p></div>)}</div>
   <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-blue-100 bg-white p-5"><h3 className="mb-4 font-black text-blue-950">{t.top}</h3>{data.top_players?.length?data.top_players.map((p,i)=><div key={p.id} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{i+1}. {p.display_name}</p><p className="text-xs text-slate-500">Level {p.level} · {p.quests_completed} quests</p></div><b className="text-sm text-amber-600">{p.xp_total} XP</b></div>):<p className="text-sm text-slate-500">{t.noData}</p>}</div>
   <div className="rounded-2xl border border-blue-100 bg-white p-5"><h3 className="mb-4 font-black text-blue-950">{t.recent}</h3>{data.recent_completions?.length?data.recent_completions.map((c,i)=><div key={i} className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-0"><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-800">{c.display_name||c.player_id.slice(0,8)}</p><p className="truncate text-xs text-slate-500">{localize(c.title,lang)} · {date(c.completed_at)}</p></div><b className="shrink-0 text-xs text-emerald-600">+{c.xp_awarded} XP</b></div>):<p className="text-sm text-slate-500">{t.noData}</p>}</div></div>
   <div className="rounded-2xl border border-blue-100 bg-white p-5"><h3 className="mb-4 font-black text-blue-950">{t.attempts}</h3>{data.recent_verification_attempts?.length?<div className="space-y-2">{data.recent_verification_attempts.map((a,i)=><div key={i} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0"><div><p className="text-sm font-bold text-slate-800">{a.quest_id||'Unknown quest'} · {a.method}</p><p className="text-xs text-slate-500">{a.failure_reason||date(a.created_at)}{a.distance_meters!=null? ' · '+Math.round(a.distance_meters)+'m':''}</p></div><span className={a.succeeded?'rounded-lg bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700':'rounded-lg bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700'}>{a.succeeded?t.success:t.failed}</span></div>)}</div>:<p className="text-sm text-slate-500">{t.noData}</p>}</div>
  </>}
  </>}
 </section>;
};
export default AdminDashboard;
