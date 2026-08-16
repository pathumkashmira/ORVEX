/**
 * TextMaskReveal
 * Each word slides up from behind an overflow-hidden container (the "mask").
 * Staggered per word. Respects prefers-reduced-motion.
 *
 * Usage:
 *   <TextMaskReveal text="FORM. MOTION. BEYOND." as="h2" className="..." delay={0.1} />
 *
 * To share a single IntersectionObserver across multiple instances
 * in the same visual group, pass externalInView={inView} from the parent.
 */

import { type CSSProperties, type ElementType } from "react";
import { useInView } from "@/motion/useInView";
import { useReducedMotion } from "@/motion/useReducedMotion";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Stagger start delay in seconds */
  delay?: number;
  /** Per-word stagger increment in seconds */
  wordDelay?: number;
  /** Override internal IntersectionObserver with an external inView value */
  externalInView?: boolean;
}

export default function TextMaskReveal({
  text,
  as: Tag = "span",
  className,
  style,
  delay = 0,
  wordDelay = 0.058,
  externalInView,
}: Props) {
  const reduced = useReducedMotion();
  const [ref, internalInView] = useInView<HTMLElement>({ threshold: 0.1 });
  const inView = externalInView !== undefined ? externalInView : internalInView;

  const words = text.split(" ").filter(Boolean);
  const active = inView || reduced;

  const El = Tag as any;

  return (
    <El
      ref={externalInView !== undefined ? undefined : ref}
      className={className}
      style={style}
    >
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            lineHeight: "inherit",
          }}
        >
          <span
            style={{
              display: "inline-block",
              transform: active ? "translateY(0)" : "translateY(110%)",
              opacity: active ? 1 : 0,
              transition: reduced
                ? "none"
                : [
                    `transform 1.05s cubic-bezier(0.16,1,0.3,1) ${delay + i * wordDelay}s`,
                    `opacity 0.5s ease ${delay + i * wordDelay}s`,
                  ].join(", "),
              willChange: "transform",
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </El>
  );
}
