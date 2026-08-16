/** Signature easing curves — slow, physical, cinematic */
export const ease = {
  /** Expo out — primary reveal easing. Fast start, long tail. */
  out: "cubic-bezier(0.16, 1, 0.3, 1)",
  /** Expo in-out — used for transitions and overlays. */
  inOut: "cubic-bezier(0.87, 0, 0.13, 1)",
  /** Gentle spring — magnetic return, hover snaps. */
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  /** Standard ease-out — subtle UI transitions. */
  soft: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
} as const;

/** Duration scale in seconds */
export const dur = {
  fast: 0.3,
  base: 0.6,
  slow: 0.95,
  xslow: 1.4,
  crawl: 2.2,
} as const;
