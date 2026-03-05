export const VARIANT_TYPES = {
  RIGHT: "right",
  LEFT: "left",
  BOTTOM: "bottom",
  TOP: "top",
};
const VARIANTS = {
  [VARIANT_TYPES.RIGHT]: {
    initial: { x: "100%" },
    animate: { x: 0 },
    exit: { x: "100%" },
  },
  [VARIANT_TYPES.LEFT]: {
    initial: { x: "-100%" },
    animate: { x: 0 },
    exit: { x: "-100%" },
  },
  [VARIANT_TYPES.BOTTOM]: {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
  },
  [VARIANT_TYPES.TOP]: {
    initial: { y: "-100%" },
    animate: { y: 0 },
    exit: { y: "-100%" },
  },
};

export const TRANSITION_CONFIG = {
  type: "spring",
  stiffness: 60,
  damping: 15,
  duration: 0.3,
  when: "afterChildren",
};
// Set initial and animate position based on the anchor prop
export const getSlideDirection = (anchor) => {
  const variant = VARIANTS[anchor];
  if (!variant) {
    return VARIANTS[VARIANT_TYPES.RIGHT];
  }
  return variant;
};
