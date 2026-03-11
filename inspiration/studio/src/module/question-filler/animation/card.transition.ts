import { QuestionNavigationDirection } from "../constant/questionNavigationDirection";

export const getTransitionConfig = (
  questionNavigationDirection: QuestionNavigationDirection
) => {
  return {
    hidden: {
      opacity: 0,
      y:
        questionNavigationDirection === QuestionNavigationDirection.UP
          ? -150
          : 150,
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
      y:
        questionNavigationDirection === QuestionNavigationDirection.UP
          ? 150
          : -150,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        delay: 0.2,
        type: "spring",
        bounce: 0.5,
      },
    },
  };
};
