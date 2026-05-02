import { Capacitor } from '@capacitor/core';

export type AppPlatform = 'web' | 'android' | 'ios';

export interface AppFeatures {
  platform: AppPlatform;
  isAndroidLight: boolean;
  allowVideoLoop: boolean;
  galleryAutoplayOnce: boolean;
  questGpsHighAccuracy: boolean;
  mapGpsHighAccuracy: boolean;
  arHighAccuracyThresholdMeters: number;
}

export const getAppFeatures = (): AppFeatures => {
  const platform = (Capacitor.getPlatform() as AppPlatform) || 'web';
  const isAndroidLight = platform === 'android';

  return {
    platform,
    isAndroidLight,
    allowVideoLoop: !isAndroidLight,
    galleryAutoplayOnce: isAndroidLight,
    questGpsHighAccuracy: true,
    mapGpsHighAccuracy: false,
    arHighAccuracyThresholdMeters: 10,
  };
};
