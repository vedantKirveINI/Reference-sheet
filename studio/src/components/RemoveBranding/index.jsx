import { useCallback, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ViewPort } from "@/module/constants/constants";

const RemoveBranding = ({ onClick, viewPort }) => {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = viewPort === ViewPort.MOBILE;

  const handleClose = useCallback(() => setIsVisible(false), []);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-island bg-gradient-to-r from-[#667eea] to-[#764ba2] p-4 shadow-island-md transition-all duration-200",
        isMobile ? "w-full min-w-0" : "w-full"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-4",
          isMobile ? "flex-col items-stretch gap-3" : "flex-row"
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-island-sm bg-white/15 backdrop-blur-sm">
          <Sparkles className="h-6 w-6 text-white" />
        </div>

        <div
          className={cn(
            "flex flex-1 items-center gap-4 min-w-0",
            isMobile ? "flex-col items-stretch gap-3" : "flex-row justify-between"
          )}
        >
          <div className="space-y-0.5">
            <h3 className="text-base font-semibold leading-tight tracking-wide text-white">
              Remove default branding in one click.
            </h3>
            <p className="text-sm font-normal leading-relaxed text-white/80">
              Deliver a clean, unbranded experience to users.
            </p>
          </div>

          <Button
            variant="outlined"
            size="medium"
            onClick={() => {
              onClick?.();
              setIsVisible(false);
            }}
            className="shrink-0 border-0 bg-white font-semibold text-[#764ba2] shadow-sm transition-all hover:bg-white/90 hover:shadow-md"
          >
            Remove Branding
          </Button>
        </div>

        <button
          onClick={handleClose}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default RemoveBranding;
