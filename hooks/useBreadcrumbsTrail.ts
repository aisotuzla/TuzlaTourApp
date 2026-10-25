import { useEffect, useRef } from "react";
import { DeviceOrientation } from "../utils/arProjection";

// ============================================================
// AR Quest Breadcrumb Trail — 2D canvas overlay for the AR camera
// Projects the Geoapify walking route as gamified chevrons
// flowing toward the next quest POI. Zero extra dependencies.
// Drop-in for Tuzla Tour Guide (React 18 + TS).
// ============================================================

export interface PoiTarget {
  id: string;
  name: string;
  lat: number;
  lng: number;
  color: string; // phase color, e.g. "#f59e0b" for Solni Trg
}

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface HeadingSource {
  // device heading in degrees [0,360), null if unavailable
  compassHeading: number | null;
  // smoothed GPS positions from your existing low-pass filter
  gpsTrack: RoutePoint[];
}

// ---------- geo helpers ----------
const R_EARTH = 6371000;

function toXY(p: RoutePoint, origin: RoutePoint): { x: number; y: number } {
  const dLat = (p.lat - origin.lat) * (Math.PI / 180);
  const dLng = (p.lng - origin.lng) * (Math.PI / 180);
  const latRad = origin.lat * (Math.PI / 180);
  return {
    x: R_EARTH * dLng * Math.cos(latRad), // east (+)
    y: R_EARTH * dLat, // north (+)
  };
}

function bearingDeg(from: RoutePoint, to: RoutePoint): number {
  const a = toXY(to, from);
  return (((Math.atan2(a.x, -a.y) * 180) / Math.PI) + 360) % 360;
}

function distM(from: RoutePoint, to: RoutePoint): number {
  const a = toXY(to, from);
  return Math.hypot(a.x, a.y);
}

// ---------- configuration ----------
const CFG = {
  FPS: 30, // throttle: matches app-wide AR budget
  AHEAD_M: 18, // length of trail projected in front of user
  CHEVRON_SPACING_M: 2.2,
  MAX_CHEVRONS: 12,
  HFOV_DEG: 60, // camera horizontal field of view
  PULSE_MS: 900, // gamified pulse period
  FADE_EDGE_DEG: 28, // chevrons fade out near screen edge
  GEOFENCE_M: 5, // unlock radius (player manual)
  LOCK_ENGAGE_M: 15, // reticle + trail handoff starts here
  LOCK_MS: 1200, // reticle lock-on sweep duration
};

// ---------- main hook ----------
export function useBreadcrumbTrail(opts: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  route: RoutePoint[]; // Geoapify walking route geometry
  target: PoiTarget | null; // current quest POI
  heading: HeadingSource;
  phaseLabel?: string;
  isActive?: boolean;
  orientation?: DeviceOrientation | null;
  // fires once when the user enters the geofence (trail hands off to reticle)
  onTargetLocked?: (target: PoiTarget) => void;
}) {
  const { canvasRef, route, target, heading, isActive = true, orientation, onTargetLocked } = opts;
  const rafRef = useRef<number | null>(null);
  const lastDrawRef = useRef(0);
  const lockedRef = useRef(false);
  const lockStartRef = useRef<number | null>(null);

  useEffect(() => {
    lockedRef.current = false;
    lockStartRef.current = null;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!isActive || !target) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const draw = (t: number) => {
      rafRef.current = requestAnimationFrame(draw);
      if (t - lastDrawRef.current < 1000 / CFG.FPS) return;
      lastDrawRef.current = t;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = (canvas.width = (canvas.clientWidth || window.innerWidth) * dpr);
      const h = (canvas.height = (canvas.clientHeight || window.innerHeight) * dpr);
      ctx.clearRect(0, 0, w, h);

      if (!target || !isActive) return;

      const me = heading.gpsTrack[heading.gpsTrack.length - 1];
      if (!me) return;

      // ---- fused heading: GPS heading wins while walking ----
      let hdg = heading.compassHeading;
      if (heading.gpsTrack.length >= 2) {
        const prev = heading.gpsTrack[heading.gpsTrack.length - 2];
        const moved = distM(prev, me);
        if (moved > 1.5) hdg = bearingDeg(prev, me); // >1.5 m since last fix = walking
      }
      if (hdg == null) return;

      // ---- geofence proximity: trail hands off to reticle ----
      const targetPos = { lat: target.lat, lng: target.lng };
      const targetDist = distM(me, targetPos);
      // 1 far away -> 0 inside geofence; trail dissolves as reticle takes over
      const handoff =
        Math.min(
          Math.max((targetDist - CFG.GEOFENCE_M) / (CFG.LOCK_ENGAGE_M - CFG.GEOFENCE_M), 0),
          1
        );

      // ---- build trail points: walk along route from nearest vertex ----
      const trail = buildTrail(me, route, target);
      if (trail.length === 0) return;

      // ---- project & draw chevrons ----
      const pulse = (t % CFG.PULSE_MS) / CFG.PULSE_MS; // 0..1
      const cx = w / 2;

      // Dynamic tilt compensation from device beta angle
      const pitchOffset = orientation?.beta ? ((orientation.beta - 70) / 90) * h * 0.25 : 0;
      const horizonY = Math.max(h * 0.15, Math.min(h * 0.7, h * 0.38 + pitchOffset));
      const groundY = h * 0.95;

      trail.forEach((p, i) => {
        const rel = toXY(p, me); // meters east/north of user
        const worldBearing = (Math.atan2(rel.x, -rel.y) * 180) / Math.PI;
        let delta = worldBearing - hdg;
        delta = ((delta + 540) % 360) - 180; // -180..180

        if (Math.abs(delta) > CFG.HFOV_DEG / 2 + 8) return; // off-screen

        const d = distM(me, p);
        if (d < 0.8 || d > CFG.AHEAD_M) return;

        // perspective: distance -> screen y (near = low on screen)
        const nd = (d - 0.8) / (CFG.AHEAD_M - 0.8); // 0..1
        const y = groundY - nd * nd * (groundY - horizonY); // quadratic = ground plane feel
        const x = cx + (delta / (CFG.HFOV_DEG / 2)) * (w / 2) * 0.92;

        // fade near screen edges and at horizon
        const edgeFade = 1 - Math.min(Math.abs(delta) / CFG.FADE_EDGE_DEG, 1) * 0.6;
        const distFade = 1 - nd * 0.55;

        // gamified pulse: chevrons "flow" toward the POI
        const flow = (pulse + i / trail.length) % 1;
        const pulseAlpha = 0.35 + 0.65 * Math.sin(flow * Math.PI);

        drawChevron(ctx, x, y, w, hdg, worldBearing, target.color, edgeFade * distFade * pulseAlpha * handoff);
      });

      // ---- POI beacon label (2D, cheap) ----
      drawPoiLabel(ctx, w, me, target, hdg, CFG.HFOV_DEG);

      // ---- "Target Locked" reticle inside geofence ----
      if (targetDist <= CFG.GEOFENCE_M) {
        if (!lockedRef.current) {
          lockedRef.current = true;
          lockStartRef.current = t;
          onTargetLocked?.(target);
        }
        drawLockReticle(ctx, w, h, target, t - (lockStartRef.current ?? t));
      } else {
        lockedRef.current = false; // left the radius before scanning -> re-arm
        lockStartRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [canvasRef, route, target, heading, isActive, orientation, onTargetLocked]);
}

// ---------- trail construction ----------
function buildTrail(me: RoutePoint, route: RoutePoint[], target: PoiTarget): RoutePoint[] {
  // If route is empty or very short, interpolate direct trail towards POI
  if (!route || route.length < 2) {
    const pts: RoutePoint[] = [];
    const totalDist = distM(me, { lat: target.lat, lng: target.lng });
    const count = Math.min(CFG.MAX_CHEVRONS, Math.max(3, Math.floor(Math.min(totalDist, CFG.AHEAD_M) / CFG.CHEVRON_SPACING_M)));
    for (let i = 1; i <= count; i++) {
      const frac = (i * CFG.CHEVRON_SPACING_M) / Math.max(totalDist, 1);
      if (frac >= 1) break;
      pts.push({
        lat: me.lat + (target.lat - me.lat) * frac,
        lng: me.lng + (target.lng - me.lng) * frac,
      });
    }
    pts.push({ lat: target.lat, lng: target.lng });
    return pts;
  }

  // find nearest route vertex, then emit chevron anchor points along the polyline
  let bestIdx = 0;
  let bestD = Infinity;
  route.forEach((p, i) => {
    const d = distM(me, p);
    if (d < bestD) {
      bestD = d;
      bestIdx = i;
    }
  });

  const pts: RoutePoint[] = [];
  let s = 0;
  for (let i = bestIdx; i < route.length - 1 && pts.length < CFG.MAX_CHEVRONS; i++) {
    const a = route[i];
    const b = route[i + 1];
    const segLen = distM(a, b);
    if (segLen < 0.1) continue;
    while (s <= segLen && pts.length < CFG.MAX_CHEVRONS) {
      const f = Math.max(0, Math.min(1, s / segLen));
      pts.push({ lat: a.lat + (b.lat - a.lat) * f, lng: a.lng + (b.lng - a.lng) * f });
      s += CFG.CHEVRON_SPACING_M;
    }
    s -= segLen; // carry over remainder to next segment
  }
  // always include the POI itself as the trail terminus
  pts.push({ lat: target.lat, lng: target.lng });
  return pts;
}

// ---------- drawing ----------
function drawChevron(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  canvasW: number,
  hdg: number,
  worldBearing: number,
  color: string,
  alpha: number
) {
  // rotate chevron to point along the route direction on the ground plane
  const rel = ((worldBearing - hdg + 540) % 360) - 180;
  const size = Math.max(canvasW * 0.018, 14);
  const depthScale = 0.55 + 0.45 * (1 - Math.abs(rel) / 90); // slight fake-3D squash

  ctx.save();
  ctx.globalAlpha = Math.max(alpha, 0);
  ctx.translate(x, y);
  ctx.rotate((rel * Math.PI) / 180 * 0.35); // subtle turn lean, not full roll
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  ctx.beginPath();
  ctx.moveTo(0, -size * depthScale);
  ctx.lineTo(size * 0.7, size * 0.5 * depthScale);
  ctx.lineTo(0, size * 0.15 * depthScale);
  ctx.lineTo(-size * 0.7, size * 0.5 * depthScale);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawPoiLabel(
  ctx: CanvasRenderingContext2D,
  w: number,
  me: RoutePoint,
  target: PoiTarget,
  hdg: number,
  hfov: number
) {
  const worldBearing = bearingDeg(me, { lat: target.lat, lng: target.lng });
  let delta = worldBearing - hdg;
  delta = ((delta + 540) % 360) - 180;
  if (Math.abs(delta) > hfov / 2) return; // off-screen -> "Target Locked" reticle handles it

  const d = distM(me, { lat: target.lat, lng: target.lng });
  const x = w / 2 + (delta / (hfov / 2)) * (w / 2) * 0.8;
  const y = 34 * devicePixelRatio;

  ctx.save();
  ctx.font = `${13 * devicePixelRatio}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  const label = `${target.name} · ${d < 950 ? Math.round(d) + " m" : (d / 1000).toFixed(1) + " km"}`;
  const tw = ctx.measureText(label).width;
  ctx.fillRect(x - tw / 2 - 10, y - 15 * devicePixelRatio, tw + 20, 20 * devicePixelRatio);
  ctx.fillStyle = target.color;
  ctx.fillText(label, x, y);
  ctx.restore();
}

// ---------- "Target Locked" reticle ----------
function drawLockReticle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  target: PoiTarget,
  elapsedMs: number
) {
  const cx = w / 2;
  const cy = h / 2;
  const baseR = Math.min(w, h) * 0.11;

  // lock-on sweep: brackets fly in over LOCK_MS, then a steady pulsing ring
  const sweep = Math.min(elapsedMs / CFG.LOCK_MS, 1);
  const ease = 1 - Math.pow(1 - sweep, 3); // ease-out cubic
  const bracketOff = baseR * (3.5 - 2.5 * ease); // from far outside to resting offset

  ctx.save();
  ctx.strokeStyle = target.color;
  ctx.lineWidth = 2.5 * devicePixelRatio;
  ctx.lineCap = "round";
  ctx.shadowColor = target.color;
  ctx.shadowBlur = 12;

  // four corner brackets
  const arm = baseR * 0.55;
  const corners: [number, number][] = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  for (const [sx, sy] of corners) {
    const bx = cx + sx * bracketOff;
    const by = cy + sy * bracketOff;
    ctx.beginPath();
    ctx.moveTo(bx, by + sy * arm);
    ctx.lineTo(bx, by);
    ctx.lineTo(bx + sx * arm, by);
    ctx.stroke();
  }

  // steady pulse ring after sweep completes
  if (sweep >= 1) {
    const pulse = (Math.sin(elapsedMs / 180) + 1) / 2; // 0..1
    ctx.globalAlpha = 0.35 + 0.4 * pulse;
    ctx.beginPath();
    ctx.arc(cx, cy, baseR * (1.05 + 0.08 * pulse), 0, Math.PI * 2);
    ctx.stroke();
  }

  // "TARGET LOCKED" caption
  ctx.globalAlpha = 1;
  ctx.font = `bold ${12 * devicePixelRatio}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.fillStyle = target.color;
  ctx.shadowBlur = 6;
  ctx.fillText(
    `TARGET LOCKED · ${target.name.toUpperCase()}`,
    cx,
    cy + baseR * 2.1
  );
  ctx.restore();
}