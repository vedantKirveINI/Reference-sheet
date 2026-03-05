import { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import animationData from "@src/assets/lotties/tinycommand-loading.json";

interface IntegrationLoaderProps {
  message?: string;
  height?: string;
  className?: string;
}

const IntegrationLoader = ({
  message = "Loading...",
  height = "2rem",
  className = "",
}: IntegrationLoaderProps) => {
  const lottieRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lottieRef.current && typeof (lottieRef.current as { setSpeed?: (speed: number) => void }).setSpeed === 'function') {
      (lottieRef.current as { setSpeed: (speed: number) => void }).setSpeed(2);
    }
  }, []);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center gap-3 py-6 ${className}`}
      data-testid="integration-loader"
    >
      <Lottie
        animationData={animationData}
        loop={true}
        style={{ height }}
        lottieRef={lottieRef as React.RefObject<unknown>}
      />
      {message && (
        <span className="text-sm text-muted-foreground font-medium">
          {message}
        </span>
      )}
    </div>
  );
};

export default IntegrationLoader;
