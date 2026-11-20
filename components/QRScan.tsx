import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CheckCircle2, CircleAlert, Compass, LoaderCircle, MapPin, QrCode, RefreshCw, ShieldCheck, Sparkles, Trophy, X } from 'lucide-react';
import { Language } from '../types';
import { supabase } from '../lib/supabaseClient';
import { ensurePlayerSession } from '../lib/playerSession';
import { QUEST_TARGETS, PHASE_1_POIS, PHASE_2_POIS, PHASE_3_POIS, GRAND_FINALE_POIS, QUEST_TARGET_COORDS } from '../constants/questData';

type QuestRow = { id: string; title: Record<string,string>; description: Record<string,string> | null; phase: number; xp_reward: number; radius_meters: number; is_active: boolean };
type Dashboard = { xp_total?: number; level?: number; level_title?: string; quests_completed?: number; completed_quests?: Array<{quest_id:string;xp_awarded:number;completed_at:string}>; achievements?: Array<{id:string;title:string|Record<string,string>;icon?:string}> };
type Props = { lang: Language; onNavigateToTarget: (target: {name:string;lat:number;lon:number}) => void };
const copy = {
 en:{title:'Tuzla Quest',sub:'Explore the city. Scan the real-world QR markers. Earn XP.',scan:'Scan location QR',stop:'Stop camera',start:'Start camera',camera:'Camera ready when you are',gps:'Location verification is required',near:'You are at the location',far:'Move closer to the marked location',done:'Quest completed',already:'Already completed',error:'Could not verify this QR code',unknown:'This QR code is not part of the Tuzla quest',quests:'Your quest route',progress:'Progress',xp:'Total XP',level:'Level',completed:'completed',navigate:'Navigate',loading:'Loading your quest…',permission:'Allow camera and location access to scan a quest.',retry:'Try again',phases:['Old Town','Bosnian Kingdom','Pannonian Sailor','Salt City Winner'],cameraError:'Camera could not start. Check browser permissions and try again.',gpsError:'GPS position unavailable. Enable location and retry outdoors.',scanHelp:'Find a marked QR sign at the location and hold it inside the frame.',secure:'Secure QR + GPS verification',reward:'XP awarded',next:'Keep exploring',refresh:'Refresh progress'},
 bs:{title:'Tuzlanska potraga',sub:'Istraži grad. Skeniraj QR oznake na lokacijama. Osvoji XP.',scan:'Skeniraj QR lokacije',stop:'Zaustavi kameru',start:'Pokreni kameru',camera:'Kamera je spremna',gps:'Potrebna je GPS potvrda lokacije',near:'Nalaziš se na lokaciji',far:'Približi se označenoj lokaciji',done:'Zadatak završen',already:'Već završeno',error:'QR kod nije moguće potvrditi',unknown:'Ovaj QR kod nije dio tuzlanske potrage',quests:'Tvoja ruta potrage',progress:'Napredak',xp:'Ukupno XP',level:'Nivo',completed:'završeno',navigate:'Navigacija',loading:'Učitavanje potrage…',permission:'Dozvoli pristup kameri i lokaciji za skeniranje.',retry:'Pokušaj ponovo',phases:['Stara čaršija','Bosansko kraljevstvo','Panonski mornar','Pobjednik Grada soli'],cameraError:'Kamera se ne može pokrenuti. Provjeri dozvole i pokušaj ponovo.',gpsError:'GPS lokacija nije dostupna. Uključi lokaciju i pokušaj ponovo na otvorenom.',scanHelp:'Pronađi QR oznaku na lokaciji i postavi je unutar okvira.',secure:'Sigurna QR + GPS provjera',reward:'Osvojeni XP',next:'Nastavi istraživati',refresh:'Osvježi napredak'},
 de:{title:'Tuzla-Quest',sub:'Entdecke die Stadt. Scanne QR-Markierungen vor Ort. Sammle XP.',scan:'Standort-QR scannen',stop:'Kamera stoppen',start:'Kamera starten',camera:'Kamera ist bereit',gps:'GPS-Standortprüfung erforderlich',near:'Du bist am Standort',far:'Gehe näher zum markierten Ort',done:'Quest abgeschlossen',already:'Bereits abgeschlossen',error:'QR-Code konnte nicht bestätigt werden',unknown:'Dieser QR-Code gehört nicht zur Tuzla-Quest',quests:'Deine Quest-Route',progress:'Fortschritt',xp:'XP gesamt',level:'Level',completed:'abgeschlossen',navigate:'Navigieren',loading:'Quest wird geladen…',permission:'Kamera- und Standortzugriff erlauben.',retry:'Erneut versuchen',phases:['Altstadt','Bosnisches Königreich','Pannonischer Seemann','Salzstadt-Sieger'],cameraError:'Kamera konnte nicht gestartet werden. Berechtigungen prüfen.',gpsError:'GPS-Standort nicht verfügbar. Standort aktivieren und draußen erneut versuchen.',scanHelp:'QR-Schild am Ort suchen und in den Rahmen halten.',secure:'Sichere QR- und GPS-Prüfung',reward:'XP erhalten',next:'Weiter erkunden',refresh:'Fortschritt aktualisieren'},
 tr:{title:'Tuzla Keşfi',sub:'Şehri keşfet. Gerçek konumlardaki QR işaretlerini tara. XP kazan.',scan:'Konum QR Kodunu Tara',stop:'Kamerayı Durdur',start:'Kamerayı Başlat',camera:'Kamera hazır',gps:'GPS konum doğrulaması gereklidir',near:'Konumdasın',far:'İşaretli konuma yaklaş',done:'Görev tamamlandı',already:'Zaten tamamlandı',error:'QR kodu doğrulanamadı',unknown:'Bu QR kodu Tuzla görevine ait değil',quests:'Görev rotan',progress:'İlerleme',xp:'Toplam XP',level:'Seviye',completed:'tamamlandı',navigate:'Navigasyon',loading:'Görev yükleniyor…',permission:'Tarama için kamera ve konum izni ver.',retry:'Tekrar dene',cameraError:'Kamera başlatılamadı. İzinleri kontrol et.',gpsError:'GPS konumu alınamadı. Konumu açıp dışarıda tekrar dene.',scanHelp:'Konumdaki QR tabelasını bul ve çerçevenin içine tut.',secure:'Güvenli QR + GPS doğrulaması',reward:'Kazanılan XP',next:'Keşfetmeye devam et',refresh:'İlerlemeyi yenile'}
} as const;
const coords:Record<string,{lat:number;lon:number}> = QUEST_TARGET_COORDS;
const phases=[PHASE_1_POIS,PHASE_2_POIS,PHASE_3_POIS,GRAND_FINALE_POIS];
const canonicalQuestId=(id:string)=>id==='palacinkara'?'palancinkara':id;
const localized=(v:Record<string,string>|null|undefined,lang:Language,fallback:string)=>v?.[lang]||v?.en||v?.bs||fallback;
const distance=(a:number,b:number,c:number,d:number)=>{const r=6371000,p=Math.PI/180,dl=(c-a)*p,dn=(d-b)*p;const x=Math.sin(dl/2)**2+Math.cos(a*p)*Math.cos(c*p)*Math.sin(dn/2)**2;return 2*r*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));};

const QRScan: React.FC<Props> = ({lang,onNavigateToTarget}) => {
 const t=copy[lang]||copy.en;
 const [quests,setQuests]=useState<QuestRow[]>([]);
 const [dashboard,setDashboard]=useState<Dashboard|null>(null);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [scanning,setScanning]=useState(false);
 const [status,setStatus]=useState<{kind:'success'|'error'|'info';message:string;xp?:number}|null>(null);
 const [cameraError,setCameraError]=useState('');
 const [playerId,setPlayerId]=useState('');
 const scanner=useRef<Html5Qrcode|null>(null);
 const processing=useRef(false);
 const completed=useMemo(()=>new Set(dashboard?.completed_quests?.map(q=>q.quest_id)||[]),[dashboard]);
 const ordered=useMemo(()=>phases.flatMap((ids,i)=>ids.map(id=>({id,phase:i+1}))).map(item=>({...item,quest:quests.find(q=>q.id===item.id),target:QUEST_TARGETS.find(q=>q.id===item.id)})).filter(x=>x.quest&&x.target),[quests]);
 const refresh=useCallback(async()=>{
  setLoading(true);
  try{
   const session=await ensurePlayerSession(lang==='bs'?'Gost istraživač':'Guest explorer');
   setPlayerId(session.user.id);
   const [q,d]=await Promise.all([
    supabase.from('quests').select('id,title,description,phase,xp_reward,radius_meters,is_active').eq('is_active',true).order('phase'),
    (supabase as any).rpc('get_my_tuzla_dashboard')
   ]);
   if(q.error) throw q.error;
   if(d.error) throw d.error;
   setQuests((q.data||[]) as QuestRow[]);
   setDashboard((d.data||{}) as Dashboard);
  }catch(e){console.error('[QuestHub] load failed',e);setStatus({kind:'error',message:e instanceof Error?e.message:t.error});}
  finally{setLoading(false);}
 },[lang,t.error]);
 useEffect(()=>{void refresh();},[refresh]);
 const stop=useCallback(async()=>{
  const current=scanner.current;
  scanner.current=null;
  if(current){try{if(current.isScanning) await current.stop();}catch(e){console.warn('[QuestHub] camera stop',e);}try{current.clear();}catch{}}
  setScanning(false);
 },[]);
 useEffect(()=>()=>{const current=scanner.current;if(current?.isScanning)void current.stop().catch(()=>{});},[]);
 const complete=useCallback(async(payload:string)=>{
  if(processing.current)return;
  processing.current=true;
  try{
   const normalized=payload.trim();
   const {findQuestTargetFromQr}=await import('../utils/qrMatcher');
   const target=findQuestTargetFromQr(normalized);
   if(!target){setStatus({kind:'error',message:t.unknown});return;}
   // The database verifies the QR payload and POI binding. Client GPS is only
   // supplied for the server-side geofence; it does not authorize a reward.
   const position=await new Promise<GeolocationPosition>((resolve,reject)=>{
    if(!navigator.geolocation){reject(new Error('gps'));return;}
    navigator.geolocation.getCurrentPosition(resolve,reject,{enableHighAccuracy:true,timeout:15000,maximumAge:0});
   }).catch(()=>{throw new Error('gps');});
   const {data,error}=await (supabase as any).rpc('complete_tuzla_quest',{p_quest_id:canonicalQuestId(target.id),p_qr_payload:normalized,p_lat:position.coords.latitude,p_lon:position.coords.longitude});
   if(error)throw error;
   const result=data as {ok?:boolean;code?:string;xp_awarded?:number;xp_total?:number}|null;
   if(result?.ok||result?.code==='already_completed'){
    setStatus({kind:'success',message:result.code==='already_completed'?t.already:t.done,xp:result.xp_awarded||0});
    await refresh();
   }else{
    const messages:Record<string,string>={invalid_qr:t.error,qr_not_configured:t.error,gps_required:t.gpsError,outside_geofence:t.far,outside_radius:t.far,already_completed:t.already};
    setStatus({kind:'error',message:messages[result?.code||'']||t.error});
   }
  }catch(e){console.error('[QuestHub] completion failed',e);setStatus({kind:'error',message:e instanceof Error&&e.message==='gps'?t.gpsError:t.error});}
  finally{processing.current=false;await stop();}
 },[quests,refresh,stop,t]);
 const start=async()=>{
  if(busy||scanning)return;
  setBusy(true);setCameraError('');setStatus(null);setScanning(true);
  try{
   await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>r(null))));
   const el=document.getElementById('quest-qr-reader');
   if(!el)throw new Error('camera_container');
   const instance=new Html5Qrcode('quest-qr-reader',{verbose:false});
   scanner.current=instance;
   await instance.start({facingMode:'environment'},{fps:10,qrbox:(w:number,h:number)=>{const size=Math.floor(Math.min(w,h)*0.72);return {width:size,height:size};},aspectRatio:1},(decoded)=>void complete(decoded),()=>{});
  }catch(e){console.error('[QuestHub] camera start failed',e);scanner.current=null;setCameraError(t.cameraError);setScanning(false);}
  finally{setBusy(false);}
 };
 const total=ordered.length;
 const count=ordered.filter(q=>completed.has(canonicalQuestId(q.id))).length;
 const xp=dashboard?.xp_total||0;
 return <div className="min-h-full w-full min-w-0 overflow-x-hidden bg-slate-50 pb-28">
  <div className="mx-auto w-full max-w-5xl space-y-4 px-3 py-4 sm:space-y-6 sm:px-6 sm:py-7">
   <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 p-5 text-white shadow-xl sm:p-7">
    <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-amber-300/20 blur-3xl"/>
    <div className="relative flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-300/40 bg-white/10 text-amber-300"><Compass size={27}/></div><div><p className="text-[10px] font-black uppercase tracking-[.22em] text-amber-300">TUZLA TOUR GUIDE</p><h1 className="text-2xl font-black tracking-tight sm:text-3xl">{t.title}</h1></div></div>
    <p className="relative mt-3 max-w-xl text-sm leading-relaxed text-blue-100">{t.sub}</p>
    <div className="relative mt-5 grid grid-cols-3 gap-2">
     <div className="rounded-2xl border border-white/15 bg-white/10 p-3"><p className="text-[10px] font-bold uppercase text-blue-100">{t.progress}</p><p className="mt-1 text-xl font-black">{count}/{total||12}</p></div>
     <div className="rounded-2xl border border-white/15 bg-white/10 p-3"><p className="text-[10px] font-bold uppercase text-blue-100">{t.xp}</p><p className="mt-1 text-xl font-black">{xp}</p></div>
     <div className="rounded-2xl border border-white/15 bg-white/10 p-3"><p className="text-[10px] font-bold uppercase text-blue-100">{t.level}</p><p className="mt-1 text-xl font-black">{dashboard?.level||1}</p></div>
    </div>
    <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-blue-950/40"><div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-yellow-200 transition-all" style={{width:`${total?count/total*100:0}%`}}/></div>
   </section>
   <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white p-4 shadow-sm sm:p-5">
    <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-amber-600">{t.secure}</p><h2 className="mt-1 text-lg font-black text-blue-950">{t.scan}</h2></div><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700"><QrCode size={25}/></div></div>
    <p className="mt-2 text-xs leading-relaxed text-slate-500">{t.scanHelp} {t.gps}</p>
    <div className="mt-4 overflow-hidden rounded-2xl bg-slate-950">
     <div id="quest-qr-reader" className={scanning?'min-h-[260px] w-full overflow-hidden':'hidden'}/>
     {!scanning&&<div className="flex min-h-[170px] flex-col items-center justify-center px-5 py-7 text-center text-white"><div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/30 bg-blue-500/15 text-amber-300"><Camera size={28}/></div><p className="text-sm font-bold">{t.camera}</p><p className="mt-1 max-w-xs text-xs text-slate-400">{t.permission}</p></div>}
    </div>
    {cameraError&&<p className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700"><CircleAlert size={16} className="shrink-0"/>{cameraError}</p>}
    <button type="button" disabled={busy} onClick={()=>scanning?void stop():void start()} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-900/15 transition active:scale-[.99] disabled:opacity-60">{busy?<LoaderCircle className="animate-spin" size={18}/>:scanning?<X size={18}/>:<Camera size={18} />}{scanning?t.stop:t.start}</button>
   </section>
   {status&&<div role="status" className={`flex items-start gap-3 rounded-2xl border p-4 ${status.kind==='success'?'border-emerald-200 bg-emerald-50 text-emerald-900':'border-rose-200 bg-rose-50 text-rose-800'}`}>{status.kind==='success'?<CheckCircle2 size={20}/>:<CircleAlert size={20}/>}<div className="min-w-0 flex-1"><p className="text-sm font-black">{status.message}</p>{status.xp? <p className="mt-1 text-xs font-bold text-emerald-700">+{status.xp} XP</p>:null}</div><button onClick={()=>setStatus(null)} aria-label="Close" className="rounded-lg p-1"><X size={16}/></button></div>}
   <section className="space-y-3">
    <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-amber-600">{t.progress} · {count}/{total||12}</p><h2 className="mt-1 text-lg font-black text-blue-950">{t.quests}</h2></div><button onClick={()=>void refresh()} className="inline-flex items-center gap-1.5 rounded-xl border border-blue-100 bg-white px-3 py-2 text-xs font-bold text-blue-700"><RefreshCw size={14}/>{t.refresh}</button></div>
    {loading?<div className="rounded-2xl bg-white p-8 text-center text-sm font-semibold text-slate-500"><LoaderCircle className="mx-auto mb-2 animate-spin" size={22}/>{t.loading}</div>:phases.map((ids,index)=>{
     const items=ordered.filter(q=>q.phase===index+1);
     if(!items.length)return null;
     return <div key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-white px-4 py-3"><p className="text-xs font-black uppercase tracking-wide text-blue-900">{t.phases[index]}</p><span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-black text-blue-800">{items.filter(q=>completed.has(q.id)).length}/{items.length}</span></div><div className="divide-y divide-slate-100">{items.map(({id,quest,target})=>{const isDone=completed.has(canonicalQuestId(id));const point=coords[id];return <div key={id} className={`flex min-w-0 items-center gap-3 p-3 sm:p-4 ${isDone?'bg-slate-50/80':''}`}><div className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl ${isDone?'bg-emerald-100 text-emerald-700':'bg-blue-50 text-blue-700'}`}>{isDone?<CheckCircle2 size={21}/>:<MapPin size={21}/>}</div><div className="min-w-0 flex-1"><p className={`truncate text-sm font-extrabold ${isDone?'text-slate-500':'text-slate-900'}`}>{localized(quest?.title,lang,target?.name[lang]||target?.name.en||id)}</p><p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500">{localized(quest?.description,lang,target?.description[lang]||target?.description.en||'')}</p><p className="mt-1 text-[10px] font-bold text-amber-700">{quest?.xp_reward||100} XP</p></div><button disabled={!point||isDone} onClick={()=>point&&onNavigateToTarget({name:localized(quest?.title,lang,target?.name.en||id),lat:point.lat,lon:point.lon})} className="flex min-h-10 shrink-0 items-center gap-1 rounded-xl border border-blue-100 bg-white px-2.5 text-[10px] font-black text-blue-700 disabled:opacity-40"><Compass size={14}/>{t.navigate}</button></div>})}</div></div>
    })}
   </section>
   <div className="flex items-center justify-center gap-2 pb-4 text-[10px] font-semibold text-slate-400"><ShieldCheck size={14}/>{t.secure}</div>
  </div>
 </div>;
};
export default QRScan;
