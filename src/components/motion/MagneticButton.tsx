/**
 * MagneticButton
 * Wraps any child with a magnetic hover effect — the element
 * drifts slightly toward the cursor, then springs back on leave.
 * Respects prefers-reduced-motion (disabled when reduced).
 */

import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@/motion/useReducedMotion";

interface Props {
  children: ReactNode;
  /** Magnetic pull strength (fraction of distance to center) */
  strength?: number;
  className?: string;
  style?: CSSProperties;
}

export default function MagneticButton({
  children,
  strength = 0.32,
  className,
  style,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const reduced = useReducedMotion();

  const updatePos = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPos({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    });
  };

  const handleEnter = (e: React.MouseEvent) => {
    setActive(true);
    updatePos(e);
  };

  const handleLeave = () => {
    setActive(false);
    setPos({ x: 0, y: 0 });
  };

  return (
    <div
      ref={ref}
      onMouseMove={updatePos}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        ...style,
        display: "inline-block",
        transform: reduced ? "none" : `translate(${pos.x}px, ${pos.y}px)`,
        transition: reduced
          ? "none"
          : active
          ? "transform 0.12s linear"
          : "transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
