export const styles = {
  container: {
    height: "100%",
    width: "100%",
    fontFamily: "Noto Serif",
  },
} as const;

export const transitions = {
  hidden: {
    opacity: 0,
    y: 150,
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
    y: -150,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      delay: 0.2,
      type: "spring",
      bounce: 0.5,
    },
  },
};
