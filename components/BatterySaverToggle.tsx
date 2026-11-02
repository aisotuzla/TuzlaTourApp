import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull, Zap, Settings, X, Check, AlertTriangle, Sparkles } from 'lucide-react';
import { useBatterySaver, formatBatteryPercentage, getBatteryIcon } from '../hooks/useBatterySaver';
import { Language } from '../types';

interface BatterySaverToggleProps {
  lang: Language;
  className?: string;
  showDetailedStats?: boolean;
  compact?: boolean;
}

const BATTERY_LOCALIZATION: Record<Language, any> = {
  en: {
    batterySaver: 'Power & Quality',
    autoMode: 'Auto',
    manualMode: 'Manual',
    batteryLevel: 'Battery',
    charging: 'Charging',
    lowBattery: 'Low Battery!',
    criticalBattery: 'Critical Battery!',
    enableSaver: 'Enable Battery Saver',
    disableSaver: 'Disable Battery Saver',
    recommendations: 'Power Recommendations',
    cameraFps: 'Camera FPS',
    gpsAccuracy: 'GPS Accuracy',
    animations: 'Animations',
    effects: 'Visual Effects',
    currentSettings: 'Current Settings',
    optimizedFor: 'Optimized for battery life',
    normalMode: 'Balanced',
    saverActive: 'Battery saver active',
    stationery: 'Stationary',
    moving: 'Moving',
    saveBattery: 'Battery Saver',
    powerOptimized: 'Power Optimized',
    highQuality: 'High Quality',
    highQualityDesc: '60 FPS AR • 1080p • 3D',
    balancedDesc: '30 FPS AR • 720p',
    saverDesc: '15 FPS AR • 360p (Eco)',
    forFlagships: 'PC & High-end devices',
  },
  bs: {
    batterySaver: 'Kvalitet i Baterija',
    autoMode: 'Automatski',
    manualMode: 'Ručni',
    batteryLevel: 'Nivo Baterije',
    charging: 'Punjenje',
    lowBattery: 'Niska Baterija!',
    criticalBattery: 'Kritična Baterija!',
    enableSaver: 'Omogući Štednju Baterije',
    disableSaver: 'Onemogući Štednju Baterije',
    recommendations: 'Preporuke za Potrošnju',
    cameraFps: 'FPS Kamera',
    gpsAccuracy: 'Tačnost GPS-a',
    animations: 'Animacije',
    effects: 'Vizualni Efekti',
    currentSettings: 'Trenutne Postavke',
    optimizedFor: 'Optimizirano za trajanje baterije',
    normalMode: 'Uravnoteženo',
    saverActive: 'Štednja baterije aktivna',
    stationery: 'Stalno',
    moving: 'U pokretu',
    saveBattery: 'Štednja Baterije',
    powerOptimized: 'Optimizirano za energiju',
    highQuality: 'Visok Kvalitet',
    highQualityDesc: '60 FPS AR • 1080p • 3D',
    balancedDesc: '30 FPS AR • 720p',
    saverDesc: '15 FPS AR • 360p (Eko)',
    forFlagships: 'PC i jači telefoni',
  },
  de: {
    batterySaver: 'Qualität & Akku',
    autoMode: 'Automatisch',
    manualMode: 'Manuell',
    batteryLevel: 'Akku-Stand',
    charging: 'Lädt',
    lowBattery: 'Niedriger Akku!',
    criticalBattery: 'Kritischer Akku!',
    enableSaver: 'Akku-Sparmodus aktivieren',
    disableSaver: 'Akku-Sparmodus deaktivieren',
    recommendations: 'Energie-Empfehlungen',
    cameraFps: 'Kamera FPS',
    gpsAccuracy: 'GPS-Genauigkeit',
    animations: 'Animationen',
    effects: 'Visuelle Effekte',
    currentSettings: 'Aktuelle Einstellungen',
    optimizedFor: 'Optimiert für Akkulaufzeit',
    normalMode: 'Ausgewogen',
    saverActive: 'Akku-Sparmodus aktiv',
    stationery: 'Stationär',
    moving: 'In Bewegung',
    saveBattery: 'Akku sparen',
    powerOptimized: 'Energieoptimiert',
    highQuality: 'Hohe Qualität',
    highQualityDesc: '60 FPS AR • 1080p • 3D',
    balancedDesc: '30 FPS AR • 720p',
    saverDesc: '15 FPS AR • 360p (Eco)',
    forFlagships: 'PC & High-End-Geräte',
  },
  tr: {
    batterySaver: 'Kalite ve Pil',
    autoMode: 'Otomatik',
    manualMode: 'Manuel',
    batteryLevel: 'Pil Seviyesi',
    charging: 'Şarj Oluyor',
    lowBattery: 'Düşük Pil!',
    criticalBattery: 'Kritik Pil!',
    enableSaver: 'Pil Tasarrufunu Etkinleştir',
    disableSaver: 'Pil Tasarrufunu Devre Dışı Bırak',
    recommendations: 'Güç Tavsiyeleri',
    cameraFps: 'Kamera FPS',
    gpsAccuracy: 'GPS Doğruluğu',
    animations: 'Animasyonlar',
    effects: 'Görsel Efektler',
    currentSettings: 'Mevcut Ayarlar',
    optimizedFor: 'Pil ömrü için optimize edilmiş',
    normalMode: 'Dengeli',
    saverActive: 'Pil tasarrufu aktif',
    stationery: 'Durağan',
    moving: 'Hareket halinde',
    saveBattery: 'Pil Tasarrufu',
    powerOptimized: 'Enerji Optimize',
    highQuality: 'Yüksek Kalite',
    highQualityDesc: '60 FPS AR • 1080p • 3D',
    balancedDesc: '30 FPS AR • 720p',
    saverDesc: '15 FPS AR • 360p (Eko)',
    forFlagships: 'PC ve Güçlü Telefonlar',
  },
};

export const BatterySaverToggle: React.FC<BatterySaverToggleProps> = ({
  lang,
  className = '',
  showDetailedStats = false,
  compact = false,
}) => {
  const t = BATTERY_LOCALIZATION[lang] || BATTERY_LOCALIZATION.en;
  const { state, actions, recommendations } = useBatterySaver();
  const [showModal, setShowModal] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  // Show warning when battery is critically low
  useEffect(() => {
    if (state.isCritical && !state.isCharging && !state.manualMode) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
  }, [state.isCritical, state.isCharging, state.manualMode]);

  // Auto-enable battery saver when critical
  useEffect(() => {
    if (state.isCritical && !state.isCharging && !state.manualMode) {
      actions.enableBatterySaver();
    }
  }, [state.isCritical, state.isCharging, state.manualMode, actions]);

  const getBatteryColor = () => {
    if (state.isCharging) return 'text-green-500';
    if (state.isCritical) return 'text-red-500';
    if (state.isLow) return 'text-amber-500';
    return 'text-blue-500';
  };

  const getBatteryIconComponent = () => {
    if (state.isCharging) return <BatteryCharging className="w-5 h-5" />;
    if (state.isCritical) return <BatteryLow className="w-5 h-5" />;
    if (state.isLow) return <BatteryMedium className="w-5 h-5" />;
    return <BatteryFull className="w-5 h-5" />;
  };

  const activeSaver = state.isSaverActive;

  if (!showDetailedStats) {
    return (
      <>
        {/* Battery Warning Modal */}
        {showWarning && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border-2 border-red-500">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-lg font-bold text-red-600">{t.criticalBattery}</h3>
              </div>
              <p className="text-slate-600 mb-4">
                {lang === 'bs' 
                  ? `Nivo baterije je kritično nizak ${formatBatteryPercentage(state.batteryLevel)}. Preporučujemo da omogućite štednju baterije.`
                  : lang === 'de'
                    ? `Akku-Stand ist kritisch niedrig (${formatBatteryPercentage(state.batteryLevel)}). Bitte aktivieren Sie den Akku-Sparmodus.`
                    : lang === 'tr'
                      ? `Pil seviyesi kritik düzeyde (${formatBatteryPercentage(state.batteryLevel)}). Lütfen pil tasarrufu modunu etkinleştirin.`
                      : `Battery level is critically low (${formatBatteryPercentage(state.batteryLevel)}). We recommend enabling battery saver.`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    actions.enableBatterySaver();
                    setShowWarning(false);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  {t.enableSaver}
                </button>
                <button
                  onClick={() => setShowWarning(false)}
                  className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                >
                  {lang === 'bs' ? 'Odustani' : lang === 'de' ? 'Abbrechen' : lang === 'tr' ? 'İptal' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Battery Toggle Button */}
        {compact ? (
          <button
            onClick={() => setShowModal(true)}
            className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-lg active:scale-95 transition-all shrink-0 border ${
              state.isHighQualityActive
                ? 'bg-purple-500/25 border-purple-400 text-purple-300 ring-2 ring-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : activeSaver
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                : 'bg-slate-900/60 border-white/20 text-slate-300 hover:text-white hover:border-white/40'
            } ${className}`}
            title={
              state.isHighQualityActive
                ? `${t.highQuality} (60 FPS • 1080p • 3D)`
                : activeSaver
                ? `${t.saverActive} (15 FPS)`
                : `${t.batterySaver} (30 FPS)`
            }
            aria-label={t.batterySaver}
          >
            {state.isHighQualityActive ? (
              <Sparkles className="w-5 h-5 text-purple-300 animate-pulse" />
            ) : activeSaver ? (
              <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
            ) : (
              getBatteryIconComponent()
            )}
          </button>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${className}`}
            style={{
              borderColor: state.isHighQualityActive ? '#a855f7' : activeSaver ? '#f59e0b' : '#3b82f6',
              backgroundColor: state.isHighQualityActive
                ? 'rgba(168, 85, 247, 0.15)'
                : activeSaver
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(59, 130, 246, 0.1)',
            }}
            title={state.isHighQualityActive ? t.highQuality : activeSaver ? t.saverActive : t.normalMode}
          >
            {state.isHighQualityActive ? (
              <Sparkles className="w-4 h-4 text-purple-500" />
            ) : activeSaver ? (
              <Zap className="w-4 h-4 text-amber-500" />
            ) : (
              getBatteryIconComponent()
            )}
            <span
              className={`font-semibold text-sm ${
                state.isHighQualityActive
                  ? 'text-purple-600'
                  : activeSaver
                  ? 'text-amber-500'
                  : getBatteryColor()
              }`}
            >
              {state.isHighQualityActive
                ? 'HQ 60 FPS'
                : state.isBatteryApiSupported && state.batteryLevel !== null
                ? formatBatteryPercentage(state.batteryLevel)
                : activeSaver
                ? (lang === 'bs' ? 'Štednja 15 FPS' : 'Eco 15 FPS')
                : (lang === 'bs' ? 'Standard 30 FPS' : '30 FPS')}
            </span>
            {state.isHighQualityActive ? (
              <Sparkles className="w-4 h-4 text-purple-500" />
            ) : activeSaver ? (
              <Zap className="w-4 h-4 text-amber-500" />
            ) : null}
          </button>
        )}

        {/* Battery Saver Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {state.isHighQualityActive ? (
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  ) : activeSaver ? (
                    <Zap className="w-6 h-6 text-amber-500" />
                  ) : (
                    getBatteryIconComponent()
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{t.batterySaver}</h3>
                    <p className="text-xs text-slate-500">
                      {state.isHighQualityActive
                        ? `${t.highQuality} (60 FPS • 1080p)`
                        : activeSaver
                        ? `${t.saverActive} (15 FPS)`
                        : `${t.normalMode} (30 FPS)`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Battery Status */}
              <div className="bg-slate-50 rounded-lg p-4 mb-5">
                {state.isBatteryApiSupported && state.batteryLevel !== null ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">{t.batteryLevel}</span>
                      <span className={`font-bold ${getBatteryColor()}`}>
                        {formatBatteryPercentage(state.batteryLevel)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all ${getBatteryColor().replace('text-', 'bg-')}`}
                        style={{ width: `${(state.batteryLevel || 0) * 100}%` }}
                      />
                    </div>
                    {state.isCharging && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <BatteryCharging className="w-4 h-4" />
                        {t.charging}
                      </p>
                    )}
                  </>
                ) : (
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-700">{t.batteryLevel}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        state.isHighQualityActive
                          ? 'bg-purple-100 text-purple-800'
                          : activeSaver
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {state.isHighQualityActive
                          ? 'HQ 60 FPS'
                          : activeSaver
                          ? (lang === 'bs' ? 'Štednja 15 FPS' : 'Eco 15 FPS')
                          : (lang === 'bs' ? 'Standard 30 FPS' : '30 FPS')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      {lang === 'bs'
                        ? 'Odaberite profil performansi prema Vašem uređaju (PC, telefon ili štednja).'
                        : 'Choose performance profile suited for your device (PC, flagship or battery saving).'}
                    </p>
                  </div>
                )}
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                  {state.isStationary ? (
                    <>
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      {t.stationery}
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      {t.moving}
                    </>
                  )}
                </p>
              </div>

              {/* 3 Mode Selection Buttons */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                {/* 1. Battery Saver */}
                <button
                  type="button"
                  onClick={() => {
                    actions.enableBatterySaver();
                    setShowModal(false);
                  }}
                  className={`flex flex-col items-center justify-between p-2.5 rounded-xl border-2 transition-all text-center ${
                    activeSaver
                      ? 'border-amber-500 bg-amber-50 shadow-sm ring-1 ring-amber-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                    activeSaver ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Zap className="w-4 h-4 fill-current" />
                  </div>
                  <span className="font-bold text-xs text-slate-800 leading-tight">{t.saveBattery}</span>
                  <span className="text-[10px] text-amber-700 font-semibold mt-1">15 FPS • 360p</span>
                  <span className="text-[9px] text-slate-400">{t.saverDesc}</span>
                </button>

                {/* 2. Balanced (Standard) */}
                <button
                  type="button"
                  onClick={() => {
                    actions.disableBatterySaver();
                    setShowModal(false);
                  }}
                  className={`flex flex-col items-center justify-between p-2.5 rounded-xl border-2 transition-all text-center ${
                    !activeSaver && !state.isHighQualityActive
                      ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                    !activeSaver && !state.isHighQualityActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-800 leading-tight">{t.normalMode}</span>
                  <span className="text-[10px] text-blue-700 font-semibold mt-1">30 FPS • 720p</span>
                  <span className="text-[9px] text-slate-400">{t.balancedDesc}</span>
                </button>

                {/* 3. High Quality (PC / Flagship) */}
                <button
                  type="button"
                  onClick={() => {
                    actions.setHighQualityMode();
                    setShowModal(false);
                  }}
                  className={`flex flex-col items-center justify-between p-2.5 rounded-xl border-2 transition-all text-center relative overflow-hidden ${
                    state.isHighQualityActive
                      ? 'border-purple-500 bg-purple-50 shadow-sm ring-1 ring-purple-400'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="absolute top-0 right-0 bg-purple-600 text-[8px] font-bold text-white px-1 py-0.5 rounded-bl">
                    HQ
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                    state.isHighQualityActive ? 'bg-purple-600 text-white' : 'bg-slate-100 text-purple-400'
                  }`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-800 leading-tight">{t.highQuality}</span>
                  <span className="text-[10px] text-purple-700 font-semibold mt-1">60 FPS • 1080p</span>
                  <span className="text-[9px] text-purple-600 font-medium">{t.forFlagships}</span>
                </button>
              </div>

              {/* Current Settings */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-3 text-xs uppercase tracking-wider">{t.currentSettings}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{t.cameraFps}</span>
                    <span className="font-mono text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {recommendations.cameraFps} FPS ({recommendations.cameraWidth}x{recommendations.cameraHeight})
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{t.animations} & AR</span>
                    <span className="font-mono text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {recommendations.animationFps} FPS
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{t.gpsAccuracy}</span>
                    <span className="font-mono text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {recommendations.enableHighAccuracyGPS ? 'High Accuracy' : 'Eco Throttled'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{t.effects} & 3D</span>
                    <span className="font-mono text-xs font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {state.isHighQualityActive ? '3D + Max Glow (HQ)' : recommendations.enableGlowEffects ? 'Standard 3D' : 'Eco Minimal'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-5 bg-slate-800 text-white py-2.5 rounded-lg font-semibold hover:bg-slate-900 transition-colors shadow-sm text-sm"
              >
                {lang === 'bs' ? 'Zatvori' : lang === 'de' ? 'Schließen' : lang === 'tr' ? 'Kapat' : 'Close'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Detailed stats view
  return (
    <div className={`bg-white rounded-xl shadow-lg p-4 border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {activeSaver ? <Zap className="w-5 h-5 text-amber-500" /> : getBatteryIconComponent()}
          <div>
            <h3 className="font-bold text-slate-800">{t.batterySaver}</h3>
            <p className="text-sm text-slate-500">
              {state.isBatteryApiSupported && state.batteryLevel !== null
                ? formatBatteryPercentage(state.batteryLevel)
                : (activeSaver ? 'Eco 15 FPS' : 'Standard 30 FPS')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {state.isCharging && <BatteryCharging className="w-4 h-4 text-green-500" />}
          {activeSaver && <Zap className="w-4 h-4 text-amber-500" />}
          <button
            onClick={() => setShowModal(true)}
            className="p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Battery Status Bar */}
      {state.isBatteryApiSupported && state.batteryLevel !== null && (
        <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all ${getBatteryColor().replace('text-', 'bg-')}`}
            style={{ width: `${(state.batteryLevel || 0) * 100}%` }}
          />
        </div>
      )}

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${state.isCharging ? 'bg-green-500' : 'bg-slate-300'}`} />
          <span>{state.isCharging ? t.charging : t.batteryLevel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${state.isHighQualityActive ? 'bg-purple-500' : activeSaver ? 'bg-amber-500' : 'bg-blue-500'}`} />
          <span>{state.isHighQualityActive ? t.highQuality : activeSaver ? t.saverActive : t.normalMode}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${state.isStationary ? 'bg-blue-500' : 'bg-green-500 animate-pulse'}`} />
          <span>{state.isStationary ? t.stationery : t.moving}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-300" />
          <span>{state.isCritical ? t.criticalBattery : state.isLow ? t.lowBattery : 'Normal'}</span>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-4 pt-4 border-t border-slate-100">
        <h4 className="font-semibold text-slate-700 mb-2">{t.recommendations}</h4>
        <div className="text-sm text-slate-600 space-y-1">
          <p>{t.cameraFps}: {recommendations.cameraFps} FPS ({recommendations.cameraWidth}x{recommendations.cameraHeight})</p>
          <p>{t.animations} & AR: {recommendations.animationFps} FPS</p>
          <p>{t.gpsAccuracy}: {recommendations.enableHighAccuracyGPS ? 'High Accuracy' : 'Eco Throttled'}</p>
          <p>{t.effects} & 3D: {state.isHighQualityActive ? '3D + Max Glow (HQ)' : recommendations.enableGlowEffects ? 'Standard 3D' : 'Eco Minimal'}</p>
        </div>
      </div>

      {/* Warning Modal */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border-2 border-red-500">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-bold text-red-600">{t.criticalBattery}</h3>
            </div>
            <p className="text-slate-600 mb-4">
              {lang === 'bs' 
                ? `Nivo baterije je kritično nizak ${formatBatteryPercentage(state.batteryLevel)}.`
                : lang === 'de'
                  ? `Akku-Stand ist kritisch niedrig (${formatBatteryPercentage(state.batteryLevel)}).`
                  : lang === 'tr'
                    ? `Pil seviyesi kritik düzeyde (${formatBatteryPercentage(state.batteryLevel)}).`
                    : `Battery level is critically low (${formatBatteryPercentage(state.batteryLevel)}).`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  actions.enableBatterySaver();
                  setShowWarning(false);
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                {t.enableSaver}
              </button>
              <button
                onClick={() => setShowWarning(false)}
                className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
              >
                {lang === 'bs' ? 'Odustani' : lang === 'de' ? 'Abbrechen' : lang === 'tr' ? 'İptal' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {state.isHighQualityActive ? (
                  <Sparkles className="w-6 h-6 text-purple-600" />
                ) : activeSaver ? (
                  <Zap className="w-6 h-6 text-amber-500" />
                ) : (
                  getBatteryIconComponent()
                )}
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{t.batterySaver}</h3>
                  <p className="text-xs text-slate-500">
                    {state.isHighQualityActive
                      ? `${t.highQuality} (60 FPS • 1080p)`
                      : activeSaver
                      ? `${t.saverActive} (15 FPS)`
                      : `${t.normalMode} (30 FPS)`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* 3 Mode Selection Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {/* 1. Battery Saver */}
              <button
                type="button"
                onClick={() => {
                  actions.enableBatterySaver();
                  setShowModal(false);
                }}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border-2 transition-all text-center ${
                  activeSaver
                    ? 'border-amber-500 bg-amber-50 shadow-sm ring-1 ring-amber-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                  activeSaver ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <span className="font-bold text-xs text-slate-800 leading-tight">{t.saveBattery}</span>
                <span className="text-[10px] text-amber-700 font-semibold mt-1">15 FPS • 360p</span>
                <span className="text-[9px] text-slate-400">{t.saverDesc}</span>
              </button>

              {/* 2. Balanced (Standard) */}
              <button
                type="button"
                onClick={() => {
                  actions.disableBatterySaver();
                  setShowModal(false);
                }}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border-2 transition-all text-center ${
                  !activeSaver && !state.isHighQualityActive
                    ? 'border-blue-500 bg-blue-50 shadow-sm ring-1 ring-blue-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                  !activeSaver && !state.isHighQualityActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400'
                }`}>
                  <Check className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-slate-800 leading-tight">{t.normalMode}</span>
                <span className="text-[10px] text-blue-700 font-semibold mt-1">30 FPS • 720p</span>
                <span className="text-[9px] text-slate-400">{t.balancedDesc}</span>
              </button>

              {/* 3. High Quality (PC / Flagship) */}
              <button
                type="button"
                onClick={() => {
                  actions.setHighQualityMode();
                  setShowModal(false);
                }}
                className={`flex flex-col items-center justify-between p-2.5 rounded-xl border-2 transition-all text-center relative overflow-hidden ${
                  state.isHighQualityActive
                    ? 'border-purple-500 bg-purple-50 shadow-sm ring-1 ring-purple-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span className="absolute top-0 right-0 bg-purple-600 text-[8px] font-bold text-white px-1 py-0.5 rounded-bl">
                  HQ
                </span>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 ${
                  state.isHighQualityActive ? 'bg-purple-600 text-white' : 'bg-slate-100 text-purple-400'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-xs text-slate-800 leading-tight">{t.highQuality}</span>
                <span className="text-[10px] text-purple-700 font-semibold mt-1">60 FPS • 1080p</span>
                <span className="text-[9px] text-purple-600 font-medium">{t.forFlagships}</span>
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-5 bg-slate-800 text-white py-2.5 rounded-lg font-semibold hover:bg-slate-900 transition-colors shadow-sm text-sm"
            >
              {lang === 'bs' ? 'Zatvori' : lang === 'de' ? 'Schließen' : lang === 'tr' ? 'Kapat' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatterySaverToggle;
