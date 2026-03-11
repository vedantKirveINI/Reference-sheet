import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import classes from "../embed-settings.module.css";

const ModeSliderPositionController = () => {
  const { embedSettings, setEmbedSettings } = useFormPublishContext();

  const positionOptions = [
    { label: "Left", value: "left" },
    { label: "Right", value: "right" },
  ];

  const handleSettingChange = useCallback(
    (field, value) => {
      setEmbedSettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setEmbedSettings],
  );

  return (
    <div className={classes.dimensionGroup}>
      <label className={classes.label}>Slider Position</label>
      <div className={classes.inputGroup}>
        <Select
          value={embedSettings.sliderPosition || "right"}
          onValueChange={(value) =>
            handleSettingChange("sliderPosition", value || "right")
          }
        >
          <SelectTrigger
            className="w-full rounded-md border-[#cfd8dc]"
            data-testid="slider-position-select"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {positionOptions.map((option) => (
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

export default ModeSliderPositionController;
