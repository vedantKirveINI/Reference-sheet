import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import classes from "../embed-settings.module.css";

const ModeHeightController = () => {
  const { embedSettings, setEmbedSettings } = useFormPublishContext();

  const unitOptions = [
    { label: "Px", value: "px" },
    { label: "%", value: "%" },
  ];

  const handleDimensionChange = useCallback(
    (field, value) => {
      setEmbedSettings((prev) => ({
        ...prev,
        height: {
          ...prev.height,
          [field]: value,
        },
      }));
    },
    [setEmbedSettings],
  );

  return (
    <div className={classes.dimensionGroup}>
      <label className={classes.label}>Height</label>
      <div className={classes.inputGroup}>
        <Input
          value={embedSettings.height.value}
          onChange={(e) => handleDimensionChange("value", e.target.value)}
          className="rounded-l-md rounded-r-none border-r-0 border-black/20 font-sans text-base leading-6 tracking-wide"
          data-testid="height-input"
        />
        <Select
          value={embedSettings.height.unit}
          onValueChange={(value) => handleDimensionChange("unit", value || "%")}
        >
          <SelectTrigger
            className="w-20 rounded-l-none rounded-r-md border-black/20"
            data-testid="height-unit-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {unitOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ModeHeightController;
