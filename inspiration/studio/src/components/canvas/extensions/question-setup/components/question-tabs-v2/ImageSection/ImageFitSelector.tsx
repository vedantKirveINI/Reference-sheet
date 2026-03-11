import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Label } from "@/components/ui/label";
import { icons } from "@/components/icons";

interface ImageFitSelectorProps {
  fit: string;
  onChange: (fit: string) => void;
  disabled?: boolean;
}

const FITS = {
  COVER: "cover",
  CONTAIN: "contain",
};

const ImageFitSelector = ({
  fit,
  onChange,
  disabled = false,
}: ImageFitSelectorProps) => {
  const options = [
    { value: FITS.COVER, label: "Fill", icon: icons.maximize2, description: "Crops to fill area" },
    { value: FITS.CONTAIN, label: "Fit", icon: icons.minimize2, description: "Shows entire image" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <Label>Image Fit</Label>
      <ToggleGroup
        type="single"
        value={fit}
        onValueChange={(v) => v && onChange(v)}
        className="flex gap-2"
      >
        {options.map((option) => {
          const Icon = option.icon;

          return (
            <ToggleGroupItem
              key={option.value}
              value={option.value}
              disabled={disabled}
              data-testid={`fit-${option.value}`}
              title={option.description}
              className="flex-1 gap-1.5"
            >
              <Icon className="size-3.5" />
              {option.label}
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>
      {disabled && (
        <span className="text-xs text-muted-foreground">
          Not available with Background position
        </span>
      )}
    </div>
  );
};

export default ImageFitSelector;
