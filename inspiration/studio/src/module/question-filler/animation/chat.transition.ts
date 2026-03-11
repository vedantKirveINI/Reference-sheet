export const getTransitionConfig = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      delay: 0.2,
      type: "spring",
      stiffness: 363,
      damping: 30,
      bounce: 0.2,
    },
  },
  remove: {
    opacity: 0,
    y: -30,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      delay: 0.2,
      type: "spring",
      stiffness: 363,
      damping: 30,
      bounce: 0.2,
    },
  },
};
