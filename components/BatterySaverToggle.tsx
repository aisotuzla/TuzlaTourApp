import React, { useState, useEffect } from 'react';
import { Battery, BatteryCharging, BatteryLow, BatteryMedium, BatteryFull, Zap, Settings, X, Check, AlertTriangle } from 'lucide-react';
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
    batterySaver: 'Battery Saver',
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
    normalMode: 'Normal mode',
    saverActive: 'Battery saver active',
    stationery: 'Stationary',
    moving: 'Moving',
    saveBattery: 'Save Battery',
    powerOptimized: 'Power Optimized',
  },
  bs: {
    batterySaver: 'Štednja Baterije',
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
    normalMode: 'Normalan režim',
    saverActive: 'Štednja baterije aktivna',
    stationery: 'Stalno',
    moving: 'U pokretu',
    saveBattery: 'Uštedi Bateriju',
    powerOptimized: 'Optimizirano za energiju',
  },
  de: {
    batterySaver: 'Akku-Sparmodus',
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
    normalMode: 'Normalmodus',
    saverActive: 'Akku-Sparmodus aktiv',
    stationery: 'Stationär',
    moving: 'In Bewegung',
    saveBattery: 'Akku sparen',
    powerOptimized: 'Energieoptimiert',
  },
  tr: {
    batterySaver: 'Pil Tasarrufu',
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
    normalMode: 'Normal mod',
    saverActive: 'Pil tasarrufu aktif',
    stationery: 'Durağan',
    moving: 'Hareket halinde',
    saveBattery: 'Pil Tasarrufu',
    powerOptimized: 'Enerji Optimize',
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

  const activeSaver = state.manualMode || state.autoMode;

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
                  ? `Nivo baterije je kritično nisk ${formatBatteryPercentage(state.batteryLevel)}. Preporučujemo da omogućite štednju baterije.`
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
            className={`w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-400 flex items-center justify-center shadow-lg hover:bg-emerald-500/30 active:scale-95 transition-all shrink-0 ${className}`}
            title={activeSaver ? `${t.saverActive} (${formatBatteryPercentage(state.batteryLevel)})` : `${t.batterySaver} (${formatBatteryPercentage(state.batteryLevel)})`}
            aria-label={t.batterySaver}
          >
            {getBatteryIconComponent()}
          </button>
        ) : (
          <button
            onClick={() => setShowModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all ${className}`}
            style={{
              borderColor: activeSaver ? '#ef4444' : '#3b82f6',
              backgroundColor: activeSaver ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
            }}
            title={activeSaver ? t.saverActive : t.normalMode}
          >
            {getBatteryIconComponent()}
            <span className={`font-semibold text-sm ${getBatteryColor()}`}>
              {formatBatteryPercentage(state.batteryLevel)}
            </span>
            {activeSaver && <Zap className="w-4 h-4 text-amber-500" />}
          </button>
        )}

        {/* Battery Saver Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getBatteryIconComponent()}
                  <h3 className="text-lg font-bold text-slate-800">{t.batterySaver}</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Battery Status */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
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
                <p className="text-sm text-slate-500 flex items-center gap-1">
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

              {/* Mode Toggle */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => {
                    actions.disableBatterySaver();
                    setShowModal(false);
                  }}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    !activeSaver 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full transition-colors ${
                    !activeSaver ? 'bg-blue-500' : 'bg-slate-300'
                  }`} />
                  <span className="font-semibold text-sm">{t.normalMode}</span>
                </button>
                <button
                  onClick={() => {
                    actions.enableBatterySaver();
                    setShowModal(false);
                  }}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    activeSaver 
                      ? 'border-amber-500 bg-amber-50' 
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <Zap className={`w-6 h-6 transition-colors ${
                    activeSaver ? 'text-amber-500' : 'text-slate-400'
                  }`} />
                  <span className="font-semibold text-sm">{t.saveBattery}</span>
                </button>
              </div>

              {/* Current Settings */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-700 mb-3">{t.currentSettings}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t.cameraFps}</span>
                    <span className="font-mono text-slate-800">{recommendations.cameraFps} FPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t.animations}</span>
                    <span className="font-mono text-slate-800">{recommendations.animationFps} FPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t.gpsAccuracy}</span>
                    <span className="font-mono text-slate-800">
                      {recommendations.enableHighAccuracyGPS ? 'High' : 'Normal'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t.effects}</span>
                    <span className="font-mono text-slate-800">
                      {recommendations.enableGlowEffects ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-6 bg-slate-200 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
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
          {getBatteryIconComponent()}
          <div>
            <h3 className="font-bold text-slate-800">{t.batterySaver}</h3>
            <p className="text-sm text-slate-500">{formatBatteryPercentage(state.batteryLevel)}</p>
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
      <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
        <div
          className={`h-2 rounded-full transition-all ${getBatteryColor().replace('text-', 'bg-')}`}
          style={{ width: `${(state.batteryLevel || 0) * 100}%` }}
        />
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${state.isCharging ? 'bg-green-500' : 'bg-slate-300'}`} />
          <span>{state.isCharging ? t.charging : t.batteryLevel}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${activeSaver ? 'bg-amber-500' : 'bg-slate-300'}`} />
          <span>{activeSaver ? t.saverActive : t.normalMode}</span>
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
          <p>{t.cameraFps}: {recommendations.cameraFps} FPS</p>
          <p>{t.animations}: {recommendations.animationFps} FPS</p>
          <p>{t.gpsAccuracy}: {recommendations.enableHighAccuracyGPS ? 'High' : 'Normal'}</p>
          <p>{t.effects}: {recommendations.enableGlowEffects ? 'Enabled' : 'Disabled'}</p>
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
                ? `Nivo baterije je kritično nisk ${formatBatteryPercentage(state.batteryLevel)}.`
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
                {getBatteryIconComponent()}
                <h3 className="text-lg font-bold text-slate-800">{t.batterySaver}</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => {
                  actions.disableBatterySaver();
                  setShowModal(false);
                }}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  !activeSaver 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className={`w-6 h-6 rounded-full transition-colors ${
                  !activeSaver ? 'bg-blue-500' : 'bg-slate-300'
                }`} />
                <span className="font-semibold text-sm">{t.normalMode}</span>
              </button>
              <button
                onClick={() => {
                  actions.enableBatterySaver();
                  setShowModal(false);
                }}
                className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  activeSaver 
                    ? 'border-amber-500 bg-amber-50' 
                    : 'border-slate-200 bg-white'
                }`}
              >
                <Zap className={`w-6 h-6 transition-colors ${
                  activeSaver ? 'text-amber-500' : 'text-slate-400'
                }`} />
                <span className="font-semibold text-sm">{t.saveBattery}</span>
              </button>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 bg-slate-200 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
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
