import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const CopyableTextField = ({
  title,
  value,
  isEnabled = true,
  dataTestId,
  onCopy = () => {},
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!isEnabled) return;
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      onCopy(value);
      toast.success("Copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div
      className={cn(
        "space-y-2",
        !isEnabled && "opacity-50 pointer-events-none",
      )}
    >
      {title && (
        <Label
          className="text-sm font-medium text-foreground"
          data-testid={dataTestId ? `${dataTestId}-title` : ""}
        >
          {title}
        </Label>
      )}

      <div
        className="flex items-center gap-2 p-3 bg-muted border border-border rounded-lg"
        data-testid={dataTestId ? `${dataTestId}-value-container` : ""}
      >
        <div
          className="flex-1 text-sm text-muted-foreground truncate font-mono"
          data-testid={dataTestId ? `${dataTestId}-value` : ""}
        >
          {value}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isEnabled && (
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              aria-label="Copy to clipboard"
              data-testid={dataTestId ? `${dataTestId}-copy-icon` : ""}
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-primary" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
          {isEnabled && value && (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              aria-label="Open in new tab"
            >
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default CopyableTextField;
