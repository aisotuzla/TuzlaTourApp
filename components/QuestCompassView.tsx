import React, { useEffect, useMemo, useState } from 'react';
import { Compass, MapPin, Navigation, LocateFixed, CheckCircle2, Signal, Crosshair } from 'lucide-react';
import { Language } from '../types';
import { QUEST_TARGETS, QUEST_TARGET_COORDS, PHASE_1_POIS, PHASE_2_POIS, PHASE_3_POIS, GRAND_FINALE_POIS } from '../constants/questData';
import { useGeolocationWatcher } from '../hooks/useGeolocationWatcher';

type Props = {
  lang: Language;
  unlockedRewards: string[];
  navigationTarget?: { name: string; lat: number; lon: number } | null;
  onClearNavigation?: () => void;
};

const phases = [PHASE_1_POIS, PHASE_2_POIS, PHASE_3_POIS, GRAND_FINALE_POIS];

const copy = {
  en: { title: 'Quest map', subtitle: 'Choose one destination and follow the compass.', locate: 'Enable location', locating: 'Finding your location…', accuracy: 'GPS accuracy', distance: 'Distance', nearby: 'You are near this location', select: 'Choose a destination', completed: 'Completed', navigate: 'Navigate', gpsOff: 'Location is unavailable. You can still browse your destinations.', compass: 'Compass heading', compassHelp: 'Move your phone in a figure-eight to calibrate the compass.', phases: ['Old Town', 'Bosnian Kingdom', 'Pannonian Sailor', 'Salt City Winner'] },
  bs: { title: 'Mapa potrage', subtitle: 'Odaberi jedno odredište i prati kompas.', locate: 'Uključi lokaciju', locating: 'Tražimo tvoju lokaciju…', accuracy: 'GPS preciznost', distance: 'Udaljenost', nearby: 'Nalaziš se blizu ove lokacije', select: 'Odaberi odredište', completed: 'Završeno', navigate: 'Navigacija', gpsOff: 'Lokacija nije dostupna. I dalje možeš pregledati odredišta.', compass: 'Smjer kompasa', compassHelp: 'Pomjeri telefon u obliku osmice radi kalibracije kompasa.', phases: ['Stara čaršija', 'Bosansko kraljevstvo', 'Panonski mornar', 'Pobjednik Grada soli'] },
  de: { title: 'Quest-Karte', subtitle: 'Wähle ein Ziel und folge dem Kompass.', locate: 'Standort aktivieren', locating: 'Standort wird gesucht…', accuracy: 'GPS-Genauigkeit', distance: 'Entfernung', nearby: 'Du bist in der Nähe dieses Ortes', select: 'Ziel auswählen', completed: 'Abgeschlossen', navigate: 'Navigation', gpsOff: 'Standort nicht verfügbar. Du kannst die Ziele trotzdem ansehen.', compass: 'Kompassrichtung', compassHelp: 'Bewege dein Telefon zur Kalibrierung in einer Acht.', phases: ['Altstadt', 'Bosnisches Königreich', 'Pannonischer Seemann', 'Salzstadt-Sieger'] },
  tr: { title: 'Görev haritası', subtitle: 'Bir hedef seç ve pusulayı takip et.', locate: 'Konumu aç', locating: 'Konumun bulunuyor…', accuracy: 'GPS doğruluğu', distance: 'Mesafe', nearby: 'Bu konumun yakınındasın', select: 'Hedef seç', completed: 'Tamamlandı', navigate: 'Yol tarifi', gpsOff: 'Konum kullanılamıyor. Hedeflere göz atmaya devam edebilirsin.', compass: 'Pusula yönü', compassHelp: 'Pusulayı kalibre etmek için telefonunu sekiz şeklinde hareket ettir.', phases: ['Eski Şehir', 'Bosna Krallığı', 'Pannonian Denizcisi', 'Tuz Şehri Kazananı'] },
} as const;

const radians = (degrees: number) => degrees * Math.PI / 180;
const degrees = (radiansValue: number) => (radiansValue * 180 / Math.PI + 360) % 360;

function distanceAndBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  const distance = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const y = Math.sin(dLon) * Math.cos(radians(lat2));
  const x = Math.cos(radians(lat1)) * Math.sin(radians(lat2)) - Math.sin(radians(lat1)) * Math.cos(radians(lat2)) * Math.cos(dLon);
  return { distance, bearing: degrees(Math.atan2(y, x)) };
}

const QuestCompassView: React.FC<Props> = ({ lang, unlockedRewards, navigationTarget, onClearNavigation }) => {
  const t = copy[lang] || copy.en;
  const { position, hasPermission } = useGeolocationWatcher({ enabled: true, requestPermission: false });
  const [selectedId, setSelectedId] = useState<string>(PHASE_1_POIS[0]);
  const [heading, setHeading] = useState<number | null>(null);
  const [headingPermission, setHeadingPermission] = useState<'unknown' | 'granted' | 'denied'>('unknown');

  useEffect(() => {
    if (!navigationTarget) return;
    const match = QUEST_TARGETS.find((poi) => poi.name.en === navigationTarget.name || poi.name.bs === navigationTarget.name);
    if (match) setSelectedId(match.id);
    onClearNavigation?.();
  }, [navigationTarget, onClearNavigation]);

  useEffect(() => {
    const onOrientation = (event: DeviceOrientationEvent) => {
      const webkitEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number };
      const value = typeof webkitEvent.webkitCompassHeading === 'number'
        ? webkitEvent.webkitCompassHeading
        : typeof event.alpha === 'number' ? (360 - event.alpha) % 360 : null;
      if (value !== null && Number.isFinite(value)) setHeading(value);
    };
    window.addEventListener('deviceorientation', onOrientation, true);
    return () => window.removeEventListener('deviceorientation', onOrientation, true);
  }, []);

  const requestCompass = async () => {
    const orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<'granted' | 'denied'> };
    if (typeof orientation.requestPermission === 'function') {
      try {
        const result = await orientation.requestPermission();
        setHeadingPermission(result);
      } catch {
        setHeadingPermission('denied');
      }
    } else {
      setHeadingPermission('granted');
    }
  };

  const ordered = useMemo(() => phases.flatMap((ids, phase) => ids.map((id) => ({
    id, phase, poi: QUEST_TARGETS.find((item) => item.id === id), coords: QUEST_TARGET_COORDS[id],
  }))).filter((item) => item.poi && item.coords), []);

  const selected = ordered.find((item) => item.id === selectedId) || ordered[0];
  const completed = unlockedRewards.includes(selected.id);
  const guidance = position && selected?.coords
    ? distanceAndBearing(position.lat, position.lng, selected.coords.lat, selected.coords.lon)
    : null;
  const near = Boolean(guidance && position && position.accuracy <= 35 && guidance.distance <= 25);
  const arrowRotation = guidance ? guidance.bearing - (heading ?? 0) : 0;
  const distanceLabel = guidance ? guidance.distance < 1000 ? `${Math.round(guidance.distance)} m` : `${(guidance.distance / 1000).toFixed(1)} km` : '—';

  return (
    <main className="min-h-full w-full min-w-0 overflow-x-hidden bg-slate-50 px-3 py-4 pb-28 sm:px-6 sm:py-7">
      <div className="mx-auto max-w-3xl space-y-4">
        <header className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-amber-300/40 bg-white/10 p-3 text-amber-300"><Compass size={26}/></div>
            <div><p className="text-[10px] font-black uppercase tracking-[.2em] text-amber-300">TUZLA TOUR GUIDE</p><h1 className="text-2xl font-black">{t.title}</h1></div>
          </div>
          <p className="mt-2 text-sm text-blue-100">{t.subtitle}</p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-wide text-amber-600">{t.navigate}</p><h2 className="mt-1 text-lg font-black text-blue-950">{selected?.poi?.name[lang] || selected?.poi?.name.en}</h2></div>
            {completed && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="mr-1 inline" size={14}/>{t.completed}</span>}
          </div>
          <div className="my-5 flex items-center justify-center">
            <div className="relative flex h-56 w-56 items-center justify-center rounded-full border-[10px] border-slate-100 bg-slate-50">
              <div className="absolute inset-3 rounded-full border border-dashed border-slate-300"/>
              <div className="absolute inset-0 flex items-start justify-center pt-2 text-[10px] font-black text-slate-400">N</div>
              <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-inner">
                <Navigation size={76} strokeWidth={1.7} className="text-blue-700 transition-transform duration-300" style={{ transform: `rotate(${arrowRotation}deg)` }}/>
              </div>
              <div className="absolute bottom-3 text-[10px] font-bold text-slate-400">{heading === null ? t.compass : `${Math.round(heading)}°`}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-blue-50 p-3"><p className="text-[10px] font-bold uppercase text-blue-600">{t.distance}</p><p className="mt-1 text-2xl font-black tabular-nums text-blue-950">{distanceLabel}</p></div>
            <div className="rounded-2xl bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase text-slate-500">{t.accuracy}</p><p className="mt-1 text-2xl font-black tabular-nums text-slate-900">{position ? `±${Math.round(position.accuracy)} m` : '—'}</p></div>
          </div>
          {near && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800"><MapPin className="mr-2 inline" size={16}/>{t.nearby}</p>}
          {!position && <div className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{t.gpsOff}<button onClick={() => window.location.reload()} className="ml-2 underline">{t.locate}</button></div>}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1"><Signal size={14}/>{position ? (hasPermission ? t.locating.replace('…', '') : t.gpsOff) : t.gpsOff}</span>
            <button onClick={() => void requestCompass()} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 font-bold text-blue-700"><Crosshair size={14}/>{t.compass}</button>
          </div>
          {heading === null && <p className="mt-2 text-xs text-slate-400">{t.compassHelp}</p>}
          {headingPermission === 'denied' && <p className="mt-2 text-xs text-amber-700">{t.compassHelp}</p>}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-black text-blue-950">{t.select}</h2>
          {phases.map((ids, phase) => (
            <div key={phase} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="bg-blue-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-blue-900">{t.phases[phase]}</div>
              <div className="divide-y divide-slate-100">
                {ids.map((id) => {
                  const item = ordered.find((entry) => entry.id === id);
                  if (!item) return null;
                  const isDone = unlockedRewards.includes(id);
                  const isSelected = selectedId === id;
                  return <button key={id} onClick={() => setSelectedId(id)} className={`flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left ${isSelected ? 'bg-blue-50' : 'bg-white'}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-blue-700'}`}>{isDone ? <CheckCircle2 size={18}/> : <MapPin size={18}/>}</span>
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-slate-900">{item.poi?.name[lang] || item.poi?.name.en}</span><span className="text-[10px] text-slate-500">{isDone ? t.completed : `POI · ${id}`}</span></span>
                    {isSelected && <span className="text-xs font-black text-blue-700">●</span>}
                  </button>;
                })}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
};

export default QuestCompassView;
