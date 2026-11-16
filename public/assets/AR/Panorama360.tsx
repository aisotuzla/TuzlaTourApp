import { useEffect, useRef } from "react";
import "pannellum/build/pannellum.css";
import "pannellum/build/pannellum.js"; // registers window.pannellum

// If you use TypeScript and get "Cannot find module 'pannellum/...'" errors,
// add this once in src/pannellum.d.ts:
//   declare module "pannellum/build/pannellum.js";
//   declare module "pannellum/build/pannellum.css";

declare global {
  interface Window {
    pannellum: any;
  }
}

type Props = {
  image: string;            // imported image URL
  height?: string;          // CSS height of the viewer
  autoRotate?: number;      // deg/sec (negative = other direction), 0 = off
  yaw?: number;             // starting horizontal angle
  pitch?: number;           // starting vertical angle
};

/**
 * Your photo is 4096 x 1590 (ratio 2.576:1), i.e. a 360° x ~140° partial
 * equirectangular. Pannellum handles that natively with haov / vaov / vOffset,
 * so nothing is stretched or padded.
 *
 * If the horizon looks tilted up/down, tweak V_OFFSET (+ moves image up).
 */
const IMG_W = 4096;
const IMG_H = 1590;
const H_AOV = 360;
const V_AOV = +(H_AOV * (IMG_H / IMG_W)).toFixed(2); // ≈ 139.75°
const V_OFFSET = -21; // image centre sits ~21° below the horizon

export default function Panorama360({
  image,
  height = "100dvh",
  autoRotate = -2,
  yaw = 0,
  pitch = -15,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const viewer = window.pannellum.viewer(ref.current, {
      type: "equirectangular",
      panorama: image,
      autoLoad: true,

      // partial panorama geometry
      haov: H_AOV,
      vaov: V_AOV,
      vOffset: V_OFFSET,

      // start view + limits
      yaw,
      pitch,
      hfov: 100,
      minHfov: 40,
      maxHfov: 120,

      // UX
      autoRotate,
      autoRotateInactivityDelay: 4000,
      showControls: false,        // we use touch/drag, no buttons
      showZoomCtrl: false,
      showFullscreenCtrl: false,
      mouseZoom: true,
      draggingFriction: 0.12,
      compass: false,
    });

    return () => viewer.destroy();
  }, [image, autoRotate, yaw, pitch]);

  return <div ref={ref} style={{ width: "100%", height }} />;
}
