import { Monitor, Smartphone } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

interface ViewportToggleProps {
  value: "desktop" | "mobile";
  onChange: (value: "desktop" | "mobile") => void;
  size?: "sm" | "default";
  className?: string;
}

const ViewportToggle = ({
  value,
  onChange,
  size = "sm",
  className,
}: ViewportToggleProps) => {
  const handleValueChange = (newValue: string) => {
    if (newValue) {
      onChange(newValue as "desktop" | "mobile");
    }
  };

  const iconSize = size === "sm" ? 14 : 16;

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={handleValueChange}
      className={cn(
        "bg-zinc-100 p-0.5 rounded-lg border border-zinc-200",
        className
      )}
    >
      <ToggleGroupItem
        value="desktop"
        aria-label="Desktop view"
        className={cn(
          "px-2 py-1 rounded-md text-xs font-medium transition-all",
          "data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-zinc-900",
          "data-[state=off]:text-zinc-500 data-[state=off]:hover:text-zinc-700"
        )}
      >
        <Monitor size={iconSize} className="mr-1" />
        {size === "default" && <span>Desktop</span>}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="mobile"
        aria-label="Mobile view"
        className={cn(
          "px-2 py-1 rounded-md text-xs font-medium transition-all",
          "data-[state=on]:bg-white data-[state=on]:shadow-sm data-[state=on]:text-zinc-900",
          "data-[state=off]:text-zinc-500 data-[state=off]:hover:text-zinc-700"
        )}
      >
        <Smartphone size={iconSize} className="mr-1" />
        {size === "default" && <span>Mobile</span>}
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewportToggle;
