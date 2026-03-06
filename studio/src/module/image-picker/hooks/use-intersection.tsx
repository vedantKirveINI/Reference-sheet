// useIntersection.ts
import { useEffect, useRef, useState } from "react";

export const useIntersection = (
  options: IntersectionObserverInit = {
    root: null,
    rootMargin: "100px",
    threshold: 0.1,
  }
) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target);
      }
    }, options);

    const el = ref.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [options]);

  return { ref, isVisible };
};
