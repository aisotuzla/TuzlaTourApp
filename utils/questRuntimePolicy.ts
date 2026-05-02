import { AppFeatures } from './platform';

export type QuestQualityLevel = 'cinematic' | 'balanced' | 'utility';
export type QuestQualityMode = 'auto' | 'cinematic' | 'balanced' | 'saver';

export interface QuestRuntimeSignals {
  batteryLevel: number | null;
  batterySaving: boolean;
  saveData: boolean;
  effectiveConnectionType: string | null;
}

export interface QuestPolicyUiFx {
  enableInfiniteAnimations: boolean;
  blurStrength: 'high' | 'medium' | 'low';
  glowStrength: 'high' | 'medium' | 'low';
}

export interface QuestPolicyMapFx {
  maxPitch: number;
  enable3dBuildings: boolean;
  markerComplexity: 'high' | 'medium' | 'low';
}

export interface QuestPolicyArFx {
  targetFps: number;
  cameraOnMeters: number;
  cameraOffMeters: number;
  cameraWidth: number;
  cameraHeight: number;
  cameraIdealFps: number;
  cameraMaxFps: number;
}

export interface QuestRuntimePolicy {
  mode: QuestQualityMode;
  qualityLevel: QuestQualityLevel;
  reasonTag: string | null;
  uiFx: QuestPolicyUiFx;
  mapFx: QuestPolicyMapFx;
  arFx: QuestPolicyArFx;
}

export interface QuestPolicyResolverInput {
  features: AppFeatures;
  mode: QuestQualityMode;
  signals: QuestRuntimeSignals;
  previousLevel?: QuestQualityLevel;
  lastSwitchAtMs?: number;
  nowMs?: number;
}

const levelRank: Record<QuestQualityLevel, number> = {
  utility: 0,
  balanced: 1,
  cinematic: 2,
};

const HYSTERESIS_DEGRADE_MS = 15_000;
const HYSTERESIS_PROMOTE_MS = 75_000;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const qualityFromMode = (mode: QuestQualityMode): QuestQualityLevel | null => {
  if (mode === 'cinematic') return 'cinematic';
  if (mode === 'balanced') return 'balanced';
  if (mode === 'saver') return 'utility';
  return null;
};

const autoQualityDecision = (
  features: AppFeatures,
  signals: QuestRuntimeSignals
): { quality: QuestQualityLevel; reasonTag: string | null } => {
  const batteryLevel = signals.batteryLevel;
  const lowBattery = typeof batteryLevel === 'number' && batteryLevel <= 0.2;
  const mediumBattery = typeof batteryLevel === 'number' && batteryLevel <= 0.35;
  const constrainedNetwork = signals.saveData || signals.effectiveConnectionType === 'slow-2g' || signals.effectiveConnectionType === '2g';

  if (signals.batterySaving || lowBattery) {
    return { quality: 'utility', reasonTag: 'power-saver' };
  }

  if (features.isAndroidLight || mediumBattery || constrainedNetwork) {
    return { quality: 'balanced', reasonTag: features.isAndroidLight ? 'android-balanced' : 'runtime-balance' };
  }

  return { quality: 'cinematic', reasonTag: null };
};

const withHysteresis = (
  proposedLevel: QuestQualityLevel,
  previousLevel: QuestQualityLevel | undefined,
  lastSwitchAtMs: number | undefined,
  nowMs: number
): QuestQualityLevel => {
  if (!previousLevel || !lastSwitchAtMs) return proposedLevel;
  if (previousLevel === proposedLevel) return proposedLevel;

  const previousRank = levelRank[previousLevel];
  const proposedRank = levelRank[proposedLevel];
  const isDegrade = proposedRank < previousRank;
  const elapsed = nowMs - lastSwitchAtMs;

  if (isDegrade && elapsed < HYSTERESIS_DEGRADE_MS) return previousLevel;
  if (!isDegrade && elapsed < HYSTERESIS_PROMOTE_MS) return previousLevel;

  return proposedLevel;
};

const makeUiFx = (qualityLevel: QuestQualityLevel): QuestPolicyUiFx => {
  if (qualityLevel === 'utility') {
    return {
      enableInfiniteAnimations: false,
      blurStrength: 'low',
      glowStrength: 'low',
    };
  }

  if (qualityLevel === 'balanced') {
    return {
      enableInfiniteAnimations: true,
      blurStrength: 'medium',
      glowStrength: 'medium',
    };
  }

  return {
    enableInfiniteAnimations: true,
    blurStrength: 'high',
    glowStrength: 'high',
  };
};

const makeMapFx = (qualityLevel: QuestQualityLevel): QuestPolicyMapFx => {
  if (qualityLevel === 'utility') {
    return {
      maxPitch: 55,
      enable3dBuildings: false,
      markerComplexity: 'low',
    };
  }

  if (qualityLevel === 'balanced') {
    return {
      maxPitch: 70,
      enable3dBuildings: true,
      markerComplexity: 'medium',
    };
  }

  return {
    maxPitch: 90,
    enable3dBuildings: true,
    markerComplexity: 'high',
  };
};

const makeArFx = (qualityLevel: QuestQualityLevel): QuestPolicyArFx => {
  if (qualityLevel === 'utility') {
    return {
      targetFps: 14,
      cameraOnMeters: 6,
      cameraOffMeters: 9,
      cameraWidth: 480,
      cameraHeight: 360,
      cameraIdealFps: 15,
      cameraMaxFps: 20,
    };
  }

  if (qualityLevel === 'balanced') {
    return {
      targetFps: 22,
      cameraOnMeters: 8,
      cameraOffMeters: 12,
      cameraWidth: 640,
      cameraHeight: 480,
      cameraIdealFps: 20,
      cameraMaxFps: 24,
    };
  }

  return {
    targetFps: 30,
    cameraOnMeters: 10,
    cameraOffMeters: 15,
    cameraWidth: 960,
    cameraHeight: 720,
    cameraIdealFps: 24,
    cameraMaxFps: 30,
  };
};

export const resolveQuestRuntimePolicy = ({
  features,
  mode,
  signals,
  previousLevel,
  lastSwitchAtMs,
  nowMs = Date.now(),
}: QuestPolicyResolverInput): QuestRuntimePolicy => {
  const forcedQuality = qualityFromMode(mode);
  const autoDecision = forcedQuality
    ? { quality: forcedQuality, reasonTag: null }
    : autoQualityDecision(features, signals);

  const qualityLevel = forcedQuality
    ? forcedQuality
    : withHysteresis(autoDecision.quality, previousLevel, lastSwitchAtMs, nowMs);

  const reasonTag = mode === 'auto' ? autoDecision.reasonTag : 'manual-override';

  return {
    mode,
    qualityLevel,
    reasonTag,
    uiFx: makeUiFx(qualityLevel),
    mapFx: makeMapFx(qualityLevel),
    arFx: makeArFx(qualityLevel),
  };
};

export const sanitizeQualityMode = (value: string | null | undefined): QuestQualityMode => {
  if (value === 'cinematic' || value === 'balanced' || value === 'saver' || value === 'auto') {
    return value;
  }
  return 'auto';
};

export const normalizeBatteryLevel = (value: number | null): number | null => {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return clamp(value, 0, 1);
};
