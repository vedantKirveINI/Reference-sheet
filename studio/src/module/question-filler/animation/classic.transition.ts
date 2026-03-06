export const getTransitionConfig = {
  hidden: {
    opacity: 0,
  },
  show: (stepper: number) => {
    return {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        delay: Math.sin((stepper / 12) * (Math.PI / 4)) * 0.475,
      },
    };
  },
  remove: (stepper: number) => {
    return {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        delay: Math.sin((stepper / 12) * (Math.PI / 4)) * 0.475,
      },
    };
  },
};
