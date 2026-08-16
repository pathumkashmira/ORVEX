/**
 * OrbitalTransition
 * Page transition overlay using the orbital motif.
 * Mounts on each route change (via key prop in AppShell).
 *
 * Visual: A dark circle contracts from full-screen to nothing (iris out),
 * while an orange orbital ring expands and dissolves at center.
 * Duration: ~950ms. Auto-removes itself after animation.
 */

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/motion/useReducedMotion";

export default function OrbitalTransition() {
  const [mounted, setMounted] = useState(true);
  const reduced = useReducedMotion();

  useEffect(() => {
    const duration = reduced ? 0 : 960;
    const t = setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(t);
  }, [reduced]);

  if (!mounted) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Dark iris — shrinks from full-screen to a point */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#050608",
          animation: reduced ? "none" : "orbital-iris-out 0.95s cubic-bezier(0.87, 0, 0.13, 1) forwards",
        }}
      />

      {/* Orange orbital ring — expands from center, fades out */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: 72,
          height: 72,
          border: "1px solid rgba(255, 90, 0, 0.6)",
          borderRadius: "50%",
          animation: reduced ? "none" : "orbital-ring-expand 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      />

      {/* Core dot at center */}
      <div
        style={{
          position: "absolute",
          width: 6,
          height: 6,
          background: "#ff5a00",
          borderRadius: "50%",
          animation: reduced ? "none" : "orbital-core-fade 0.95s ease forwards",
        }}
      />
    </div>
  );
}
