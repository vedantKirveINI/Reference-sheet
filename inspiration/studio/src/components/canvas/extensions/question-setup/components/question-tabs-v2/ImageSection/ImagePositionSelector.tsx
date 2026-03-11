import { Mode } from "@oute/oute-ds.core.constants";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { icons } from "@/components/icons";

interface ImagePositionSelectorProps {
  position: string;
  onChange: (position: string) => void;
  mode?: string;
}

const POSITIONS = {
  LEFT: "left",
  RIGHT: "right",
  BACKGROUND: "background",
};

const ImagePositionSelector = ({
  position,
  onChange,
  mode,
}: ImagePositionSelectorProps) => {
  const isClassicMode = mode === Mode.CLASSIC;

  const options = [
    { value: POSITIONS.LEFT, label: "Left", icon: icons.alignLeft },
    { value: POSITIONS.RIGHT, label: "Right", icon: icons.alignRight },
    { value: POSITIONS.BACKGROUND, label: "Background", icon: icons.maximize2, cardOnly: true },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Label>Image Position</Label>
      <ToggleGroup
        type="single"
        value={position}
        onValueChange={(v) => v && onChange(v)}
        className="flex gap-2"
      >
        {options.map((option) => {
          const Icon = option.icon;
          const isDisabled = option.cardOnly && isClassicMode;

          return (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              disabled={isDisabled}
              data-testid={`position-${option.value}`}
              className="flex-1 gap-1.5"
            >
              <Icon className="size-3.5" />
              {option.label}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
      {isClassicMode && (
        <span className="text-xs text-muted-foreground">
          Background only available in Card mode
        </span>
      )}
    </div>
  );
};

export default ImagePositionSelector;
