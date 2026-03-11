import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Code2 } from "lucide-react";

interface MapSwitchProps {
  nodeId: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export const MapSwitch = ({ nodeId, checked = false, onChange }: MapSwitchProps) => {
  return (
    <div className="flex items-center gap-2">
      <Label
        htmlFor={`map-toggle-${nodeId}`}
        className="text-xs text-muted-foreground flex items-center gap-1.5 cursor-pointer"
      >
        <Code2 className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Map</span>
      </Label>
      <Switch
        id={`map-toggle-${nodeId}`}
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary"
      />
    </div>
  );
};
