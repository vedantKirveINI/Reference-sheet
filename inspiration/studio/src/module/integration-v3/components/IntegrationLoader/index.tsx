import { useEffect, useRef } from "react";
import Lottie from "lottie-react";
import animationData from "@src/assets/lotties/tinycommand-loading.json";
import { cn } from "@/lib/utils";

export interface IntegrationLoaderProps {
  message?: string;
  height?: string;
  className?: string;
  subMessage?: string;
}

export function IntegrationLoader({
  message = "Loading configuration...",
  subMessage = "This may take a moment",
  height = "3rem",
  className,
}: IntegrationLoaderProps) {
  const lottieRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      lottieRef.current &&
      typeof (lottieRef.current as { setSpeed?: (speed: number) => void })
        .setSpeed === "function"
    ) {
      (lottieRef.current as { setSpeed: (speed: number) => void }).setSpeed(
        1.5
      );
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
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-12 px-6",
        "animate-in fade-in duration-300",
        className
      )}
      data-testid="integration-loader"
    >
      <div
        className={cn(
          "relative flex items-center justify-center",
          "p-4 rounded-2xl",
          "bg-gradient-to-br from-primary/5 to-primary/10",
          "ring-1 ring-primary/10"
        )}
      >
        <Lottie
          animationData={animationData}
          loop={true}
          style={{ height, width: "auto" }}
          lottieRef={lottieRef as React.RefObject<unknown>}
        />
      </div>

      <div className="flex flex-col items-center gap-1.5 text-center">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {subMessage && (
          <p className="text-xs text-muted-foreground">{subMessage}</p>
        )}
      </div>

      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full bg-primary/60",
              "animate-pulse"
            )}
            style={{
              animationDelay: `${i * 200}ms`,
              animationDuration: "1s",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default IntegrationLoader;
