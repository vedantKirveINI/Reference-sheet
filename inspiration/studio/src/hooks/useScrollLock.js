import { useEffect, useRef } from "react";

const useScrollLock = (isLocked, targetRef = null) => {
  const originalStylesRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const target = targetRef?.current || document.body;

    if (isLocked) {
      originalStylesRef.current = {
        overflow: target.style.overflow,
        paddingRight: target.style.paddingRight,
      };

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

      target.style.overflow = "hidden";
      if (scrollbarWidth > 0 && target === document.body) {
        target.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      if (originalStylesRef.current) {
        target.style.overflow = originalStylesRef.current.overflow;
        target.style.paddingRight = originalStylesRef.current.paddingRight;
        originalStylesRef.current = null;
      }
    }

    return () => {
      if (originalStylesRef.current) {
        target.style.overflow = originalStylesRef.current.overflow;
        target.style.paddingRight = originalStylesRef.current.paddingRight;
        originalStylesRef.current = null;
      }
    };
  }, [isLocked, targetRef]);
};

export default useScrollLock;
