/**
 * Adaptive Low-Pass Filter for GPS.
 * Smooths coordinates when far away to prevent map jitter,
 * but allows raw precision when close to the target.
 */
export class AdaptiveLowPassFilter {
  private smoothedLat: number | null = null;
  private smoothedLng: number | null = null;

  private getAlpha(distance: number): number {
    if (distance < 15) return 0.9;  // Very close: trust raw GPS
    if (distance < 50) return 0.6;  // Close: moderate smoothing
    if (distance < 200) return 0.3; // Medium: heavy smoothing
    return 0.1;                     // Far: very heavy smoothing
  }

  update(lat: number, lng: number, distance: number): { lat: number; lng: number } {
    const alpha = this.getAlpha(distance);
    if (this.smoothedLat === null || this.smoothedLng === null) {
      this.smoothedLat = lat;
      this.smoothedLng = lng;
    } else {
      this.smoothedLat += alpha * (lat - this.smoothedLat);
      this.smoothedLng += alpha * (lng - this.smoothedLng);
    }
    return { lat: this.smoothedLat, lng: this.smoothedLng };
  }

  reset() {
    this.smoothedLat = null;
    this.smoothedLng = null;
  }
}
