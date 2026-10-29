/**
 * Battery Saver Configuration
 * 
 * Central configuration for battery optimization across the app.
 * This file contains presets and utilities for managing power consumption.
 */

import { BatterySaverConfig } from '../hooks/useBatterySaver';

// ============================================================================
// Preset Configurations
// ============================================================================

/**
 * Maximum Performance - Best visual quality, highest power consumption
 * Use for: High-end devices, plugged in, or when battery is not a concern
 */
export const BATTERY_CONFIG_MAX_PERFORMANCE: BatterySaverConfig = {
  criticalBatteryThreshold: 0.10,
  lowBatteryThreshold: 0.20,
  
  cameraFpsNormal: 60,
  cameraFpsLowBattery: 30,
  cameraFpsCritical: 15,
  
  gpsIntervalNormal: 500,
  gpsIntervalLowBattery: 1000,
  gpsIntervalCritical: 3000,
  
  animationFpsNormal: 60,
  animationFpsLowBattery: 30,
  animationFpsCritical: 15,
  
  enableGlowEffectsNormal: true,
  enableGlowEffectsLowBattery: true,
  enable3dBuildingsNormal: true,
  enable3dBuildingsLowBattery: false,
  
  stationaryThreshold: 1.0,
  stationaryDuration: 3000,
};

/**
 * Balanced - Good quality with reasonable battery life
 * Use for: Default setting, most users
 */
export const BATTERY_CONFIG_BALANCED: BatterySaverConfig = {
  criticalBatteryThreshold: 0.15,
  lowBatteryThreshold: 0.30,
  
  cameraFpsNormal: 30,
  cameraFpsLowBattery: 15,
  cameraFpsCritical: 10,
  
  gpsIntervalNormal: 1000,
  gpsIntervalLowBattery: 2000,
  gpsIntervalCritical: 5000,
  
  animationFpsNormal: 30,
  animationFpsLowBattery: 15,
  animationFpsCritical: 10,
  
  enableGlowEffectsNormal: true,
  enableGlowEffectsLowBattery: false,
  enable3dBuildingsNormal: true,
  enable3dBuildingsLowBattery: false,
  
  stationaryThreshold: 1.5,
  stationaryDuration: 5000,
};

/**
 * Battery Saver - Prioritize battery life over visual quality
 * Use for: Extended outdoor use, old devices, or when battery is low
 */
export const BATTERY_CONFIG_BATTERY_SAVER: BatterySaverConfig = {
  criticalBatteryThreshold: 0.20,
  lowBatteryThreshold: 0.40,
  
  cameraFpsNormal: 20,
  cameraFpsLowBattery: 10,
  cameraFpsCritical: 5,
  
  gpsIntervalNormal: 2000,
  gpsIntervalLowBattery: 5000,
  gpsIntervalCritical: 10000,
  
  animationFpsNormal: 15,
  animationFpsLowBattery: 10,
  animationFpsCritical: 5,
  
  enableGlowEffectsNormal: false,
  enableGlowEffectsLowBattery: false,
  enable3dBuildingsNormal: false,
  enable3dBuildingsLowBattery: false,
  
  stationaryThreshold: 2.0,
  stationaryDuration: 8000,
};

/**
 * Aggressive Battery Saver - Maximum battery life, minimal features
 * Use for: Emergency situations, very low battery
 */
export const BATTERY_CONFIG_AGGRESSIVE: BatterySaverConfig = {
  criticalBatteryThreshold: 0.25,
  lowBatteryThreshold: 0.50,
  
  cameraFpsNormal: 15,
  cameraFpsLowBattery: 10,
  cameraFpsCritical: 5,
  
  gpsIntervalNormal: 3000,
  gpsIntervalLowBattery: 8000,
  gpsIntervalCritical: 15000,
  
  animationFpsNormal: 10,
  animationFpsLowBattery: 5,
  animationFpsCritical: 2,
  
  enableGlowEffectsNormal: false,
  enableGlowEffectsLowBattery: false,
  enable3dBuildingsNormal: false,
  enable3dBuildingsLowBattery: false,
  
  stationaryThreshold: 3.0,
  stationaryDuration: 10000,
};

// ============================================================================
// Preset Selection
// ============================================================================

/**
 * Available preset configurations
 */
export const BATTERY_PRESETS = {
  MAX_PERFORMANCE: BATTERY_CONFIG_MAX_PERFORMANCE,
  BALANCED: BATTERY_CONFIG_BALANCED,
  BATTERY_SAVER: BATTERY_CONFIG_BATTERY_SAVER,
  AGGRESSIVE: BATTERY_CONFIG_AGGRESSIVE,
} as const;

/**
 * Preset names for display
 */
export const PRESET_NAMES = {
  en: {
    MAX_PERFORMANCE: 'Maximum Performance',
    BALANCED: 'Balanced',
    BATTERY_SAVER: 'Battery Saver',
    AGGRESSIVE: 'Aggressive Saver',
  },
  bs: {
    MAX_PERFORMANCE: 'Maksimalne Performanse',
    BALANCED: 'Balansirano',
    BATTERY_SAVER: 'Štednja Baterije',
    AGGRESSIVE: 'Agresivna Štednja',
  },
  de: {
    MAX_PERFORMANCE: 'Maximale Leistung',
    BALANCED: 'Ausgeglichen',
    BATTERY_SAVER: 'Akku-Sparmodus',
    AGGRESSIVE: 'Aggressiver Sparmodus',
  },
  tr: {
    MAX_PERFORMANCE: 'Maksimum Performans',
    BALANCED: 'Dengeli',
    BATTERY_SAVER: 'Pil Tasarrufu',
    AGGRESSIVE: 'Agresif Tasarruf',
  },
};

/**
 * Get preset by name
 */
export function getPresetConfig(presetName: keyof typeof BATTERY_PRESETS): BatterySaverConfig {
  return BATTERY_PRESETS[presetName];
}

/**
 * Get preset name for display
 */
export function getPresetDisplayName(presetName: keyof typeof BATTERY_PRESETS, lang: string = 'en'): string {
  const langNames = PRESET_NAMES[lang as keyof typeof PRESET_NAMES];
  if (langNames && langNames[presetName]) {
    return langNames[presetName];
  }
  return PRESET_NAMES.en[presetName];
}

// ============================================================================
// Battery Level Utilities
// ============================================================================

/**
 * Battery level categories
 */
export enum BatteryLevelCategory {
  CRITICAL = 'CRITICAL',
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  GOOD = 'GOOD',
  FULL = 'FULL',
}

/**
 * Categorize battery level
 */
export function categorizeBatteryLevel(level: number | null): BatteryLevelCategory {
  if (level === null) return BatteryLevelCategory.NORMAL;
  if (level <= 0.10) return BatteryLevelCategory.CRITICAL;
  if (level <= 0.25) return BatteryLevelCategory.LOW;
  if (level <= 0.75) return BatteryLevelCategory.NORMAL;
  if (level <= 0.95) return BatteryLevelCategory.GOOD;
  return BatteryLevelCategory.FULL;
}

/**
 * Get color for battery level category
 */
export function getBatteryLevelColor(category: BatteryLevelCategory): string {
  switch (category) {
    case BatteryLevelCategory.CRITICAL:
      return '#ef4444'; // Red
    case BatteryLevelCategory.LOW:
      return '#f59e0b'; // Amber
    case BatteryLevelCategory.NORMAL:
      return '#3b82f6'; // Blue
    case BatteryLevelCategory.GOOD:
      return '#10b981'; // Green
    case BatteryLevelCategory.FULL:
      return '#059669'; // Emerald
    default:
      return '#6b7280'; // Gray
  }
}

/**
 * Get recommendation for battery level
 */
export function getBatteryRecommendation(
  level: number | null,
  isCharging: boolean,
  lang: string = 'en'
): string {
  const category = categorizeBatteryLevel(level);
  
  const recommendations = {
    en: {
      CRITICAL: isCharging 
        ? 'Battery critically low! Keep device plugged in.'
        : 'Battery critically low! Enable battery saver immediately.',
      LOW: isCharging 
        ? 'Battery low. Consider enabling battery saver.'
        : 'Battery low. Enable battery saver to extend usage.',
      NORMAL: 'Battery level normal. Consider enabling battery saver for extended use.',
      GOOD: 'Battery level good. Battery saver not needed unless for extended use.',
      FULL: 'Battery fully charged. No battery saver needed.',
    },
    bs: {
      CRITICAL: isCharging 
        ? 'Baterija kritično niska! Držite uređaj priključen.'
        : 'Baterija kritično niska! Odmah omogućite štednju baterije.',
      LOW: isCharging 
        ? 'Baterija niska. Razmislite o omogućavanju štednje baterije.'
        : 'Baterija niska. Omogućite štednju baterije za produženje korištenja.',
      NORMAL: 'Nivo baterije normalan. Razmislite o omogućavanju štednje baterije za produženje korištenja.',
      GOOD: 'Nivo baterije dobar. Štednja baterije nije potrebna osim za produženje korištenja.',
      FULL: 'Baterija potpuno napunjena. Štednja baterije nije potrebna.',
    },
    de: {
      CRITICAL: isCharging 
        ? 'Akku kritisch niedrig! Gerät angesteckt lassen.'
        : 'Akku kritisch niedrig! Akku-Sparmodus sofort aktivieren.',
      LOW: isCharging 
        ? 'Akku niedrig. Überlegen Sie, den Akku-Sparmodus zu aktivieren.'
        : 'Akku niedrig. Aktivieren Sie den Akku-Sparmodus, um die Laufzeit zu verlängern.',
      NORMAL: 'Akku-Stand normal. Aktivieren Sie den Akku-Sparmodus für längere Nutzung.',
      GOOD: 'Akku-Stand gut. Akku-Sparmodus nicht erforderlich, außer für längere Nutzung.',
      FULL: 'Akku voll geladen. Akku-Sparmodus nicht erforderlich.',
    },
    tr: {
      CRITICAL: isCharging 
        ? 'Pil kritik düzeyde düşük! Cihazı prize takılı tutun.'
        : 'Pil kritik düzeyde düşük! Pil tasarrufu modunu hemen etkinleştirin.',
      LOW: isCharging 
        ? 'Pil düşük. Pil tasarrufu modunu etkinleştirmeyi düşünün.'
        : 'Pil düşük. Pil tasarrufu modunu etkinleştirerek kullanım süresini uzatın.',
      NORMAL: 'Pil seviyesi normal. Uzun süreli kullanım için pil tasarrufu modunu etkinleştirmeyi düşünün.',
      GOOD: 'Pil seviyesi iyi. Pil tasarrufu modu, uzun süreli kullanım dışında gerekli değildir.',
      FULL: 'Pil tamamen dolu. Pil tasarrufu modu gerekli değildir.',
    },
  };

  const langRecs = recommendations[lang as keyof typeof recommendations];
  if (langRecs && langRecs[category]) {
    return langRecs[category];
  }
  return recommendations.en[category];
}

// ============================================================================
// Power Consumption Estimates
// ============================================================================

/**
 * Estimated power consumption rates for different features (mW)
 * These are approximate values based on typical smartphone hardware
 */
export const POWER_CONSUMPTION = {
  // Camera
  CAMERA_4K: 1500,    // mW
  CAMERA_1080P: 1000, // mW
  CAMERA_720P: 600,   // mW
  CAMERA_480P: 300,   // mW
  
  // GPS
  GPS_HIGH_ACCURACY: 300,  // mW
  GPS_NORMAL: 150,        // mW
  GPS_LOW_POWER: 50,      // mW
  
  // CPU/GPU
  ANIMATION_60FPS: 400,   // mW
  ANIMATION_30FPS: 200,   // mW
  ANIMATION_15FPS: 100,   // mW
  ANIMATION_10FPS: 50,    // mW
  
  // Display
  DISPLAY_ON: 500,        // mW (typical for OLED)
  DISPLAY_BRIGHT: 800,    // mW (100% brightness)
  
  // Network
  CELLULAR_4G: 500,       // mW
  CELLULAR_5G: 800,       // mW
  WIFI: 200,             // mW
  BLUETOOTH: 50,          // mW
  
  // Base consumption (idle)
  BASE_IDLE: 100,         // mW
  BASE_STANDBY: 50,       // mW
};

/**
 * Estimate total power consumption based on active features
 */
export function estimatePowerConsumption(
  config: Partial<BatterySaverConfig> = {}
): {
  total: number;       // mW
  breakdown: Record<string, number>;
} {
  const fullConfig: BatterySaverConfig = { ...BATTERY_CONFIG_BALANCED, ...config };
  
  const breakdown: Record<string, number> = {};
  
  // Camera
  let cameraPower = 0;
  if (fullConfig.cameraFpsNormal > 0) {
    if (fullConfig.cameraFpsNormal >= 30) {
      cameraPower = POWER_CONSUMPTION.CAMERA_720P;
    } else if (fullConfig.cameraFpsNormal >= 15) {
      cameraPower = POWER_CONSUMPTION.CAMERA_480P;
    } else {
      cameraPower = POWER_CONSUMPTION.CAMERA_480P * 0.5;
    }
    breakdown.camera = cameraPower;
  }
  
  // GPS
  let gpsPower = 0;
  if (fullConfig.gpsIntervalNormal <= 1000) {
    gpsPower = POWER_CONSUMPTION.GPS_HIGH_ACCURACY;
  } else if (fullConfig.gpsIntervalNormal <= 3000) {
    gpsPower = POWER_CONSUMPTION.GPS_NORMAL;
  } else {
    gpsPower = POWER_CONSUMPTION.GPS_LOW_POWER;
  }
  breakdown.gps = gpsPower;
  
  // Animations
  let animationPower = 0;
  if (fullConfig.animationFpsNormal >= 30) {
    animationPower = POWER_CONSUMPTION.ANIMATION_30FPS;
  } else if (fullConfig.animationFpsNormal >= 15) {
    animationPower = POWER_CONSUMPTION.ANIMATION_15FPS;
  } else {
    animationPower = POWER_CONSUMPTION.ANIMATION_10FPS;
  }
  breakdown.animations = animationPower;
  
  // Effects
  if (fullConfig.enableGlowEffectsNormal) {
    breakdown.effects = 100; // Additional GPU load
  }
  if (fullConfig.enable3dBuildingsNormal) {
    breakdown['3d_buildings'] = 150; // Additional GPU load
  }
  
  // Base
  breakdown.base = POWER_CONSUMPTION.BASE_IDLE;
  
  const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
  
  return {
    total,
    breakdown,
  };
}

/**
 * Estimate battery life based on power consumption
 */
export function estimateBatteryLife(
  powerConsumption: number, // mW
  batteryCapacity: number = 4000 // mAh (typical smartphone)
): {
  hours: number;
  minutes: number;
} {
  // Convert mAh to mWh (assuming 3.7V nominal voltage)
  const batteryEnergy = batteryCapacity * 3.7 * 1000; // mWh
  
  // Calculate hours
  const hours = batteryEnergy / powerConsumption;
  
  return {
    hours,
    minutes: Math.round(hours * 60),
  };
}

// ============================================================================
// Default Export
// ============================================================================

export {
  BATTERY_CONFIG_MAX_PERFORMANCE,
  BATTERY_CONFIG_BALANCED,
  BATTERY_CONFIG_BATTERY_SAVER,
  BATTERY_CONFIG_AGGRESSIVE,
};

export default BATTERY_CONFIG_BALANCED;
