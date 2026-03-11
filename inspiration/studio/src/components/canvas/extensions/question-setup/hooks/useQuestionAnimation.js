import { useAnimate } from "framer-motion";
import { useCallback } from "react";

export const useQuestionAnimation = () => {
  const [scope, animate] = useAnimate();

  const showingPreviewAnimation = useCallback(() => {
    if (!scope.current) return;
    animate(
      scope.current,
      {
        left: "-102%",
        // border: "1px solid #FD5D2D",
        borderRadius: "10px",
        overflow: "hidden",
        background: "#FFF",
        boxShadow: "0px 8px 20px 0px rgba(122, 124, 141, 0.2)",
      },
      { duration: 0.5, ease: "easeInOut" }
    );
  }, [animate, scope]);

  const hidePreviewAnimation = useCallback(() => {
    if (!scope.current) return;
    animate(
      scope.current,
      {
        left: "0",
        border: "0px solid transparent",
        borderRadius: "inherit",
        overflow: "visible",
        boxShadow: "none",
      },
      { duration: 0.5, ease: "easeInOut" }
    );
  }, [animate, scope]);

  return {
    showingPreviewAnimation,
    hidePreviewAnimation,
    scope,
  };
};
