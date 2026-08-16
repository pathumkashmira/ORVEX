/**
 * ParallaxLayer
 * Translates a child element vertically at a fraction of scroll position.
 * strength > 0 = moves down slower than scroll (pushes back).
 * strength < 0 = moves up faster than scroll (foreground push).
 */

import { useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import { useReducedMotion } from "@/motion/useReducedMotion";

interface Props {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: CSSProperties;
}

export default function ParallaxLayer({
  children,
  strength = 0.12,
  className,
  style,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;
    const el = ref.current;
    const update = () => {
      el.style.transform = `translateY(${window.scrollY * strength}px)`;
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [strength, reduced]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform", ...style }}>
      {children}
    </div>
  );
}
