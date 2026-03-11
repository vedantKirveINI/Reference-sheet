import { useAnimate } from "framer-motion";
import { useCallback, useState } from "react";

export const useNodeAnimation = () => {
  const [scope, animate] = useAnimate();
  const [previewOpen, setPreviewOpen] = useState(false);
  const showingPreviewAnimation = useCallback(() => {
    animate(
      scope.current,
      {
        left: "-102%",
        border: "1px solid #FD5D2D",
        borderRadius: "10px",
        overflow: "hidden",
        boxShadow: "0px 8px 20px 0px rgba(122, 124, 141, 0.2)",
      },
      { duration: 0.5, ease: "easeInOut" }
    );
    setPreviewOpen(true);
  }, [animate, scope]);

  const hidePreviewAnimation = useCallback(() => {
    animate(
      scope.current,
      {
        left: "0",
        border: "0px solid transparent",
        borderRadius: "0px",
        overflow: "visible",
        boxShadow: "none",
      },
      { duration: 0.5, ease: "easeInOut" }
    );
    setPreviewOpen(false);
  }, [animate, scope]);

  return {
    previewOpen,
    showingPreviewAnimation,
    hidePreviewAnimation,
    scope,
  };
};
