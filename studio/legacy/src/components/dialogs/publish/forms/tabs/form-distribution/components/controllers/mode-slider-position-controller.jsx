import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
// import ODSAutocomplete from "oute-ds-autocomplete";
import { ODSAutocomplete, ODSTextField } from "@src/module/ods";
import classes from "../embed-settings.module.css";
// import ODSTextField from "oute-ds-text-field";

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
        <ODSAutocomplete
          options={positionOptions}
          value={positionOptions.find(
            (opt) => opt.value === (embedSettings.sliderPosition || "right"),
          )}
          onChange={(event, newValue) =>
            handleSettingChange("sliderPosition", newValue?.value || "right")
          }
          renderInput={(params) => (
            <ODSTextField
              {...params}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "0.375rem",
                  "& fieldset": {
                    borderColor: "#cfd8dc",
                    borderWidth: "0.75px",
                  },
                  "&:hover fieldset": {
                    borderColor: "#cfd8dc",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#cfd8dc",
                  },
                },
                "& .MuiInputBase-input": {
                  fontFamily: "Inter, sans-serif",
                  fontSize: "1rem",
                  lineHeight: "1.5rem",
                  color: "#000000",
                  letterSpacing: "0.5px",
                  padding: "0.625rem",
                },
              }}
            />
          )}
          data-testid="slider-position-select"
        />
      </div>
    </div>
  );
};

export default ModeSliderPositionController;
