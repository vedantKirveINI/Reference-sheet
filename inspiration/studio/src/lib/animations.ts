/**
 * Animation utilities for Framer Motion
 * Provides consistent animation configurations for the Island Design System
 */

/**
 * Smooth, delightful spring animation (200-300ms)
 * Use for: Drawer slides, modal entrances, major transitions
 */
export const smoothSpring = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
}

/**
 * Quick, snappy transition (150ms)
 * Use for: Button clicks, toggles, immediate feedback
 */
export const snappyTransition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1] as const,
}

/**
 * Slide-in animation for drawers/modals
 * Use for: Side panels, dialogs
 */
export const slideIn = {
  initial: { x: "100%", opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
  transition: smoothSpring,
}

/**
 * Scale-up animation for hover effects
 * Use for: Island hover states, card interactions
 */
export const scaleUp = {
  whileHover: { 
    scale: 1.02, 
    y: -2,
    transition: snappyTransition 
  },
  whileTap: { 
    scale: 0.98,
    transition: snappyTransition 
  },
}

/**
 * Fade in animation
 * Use for: Content appearing, tooltips
 */
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1],
  },
}

