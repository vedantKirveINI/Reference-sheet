import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
// import ODSTextField from "oute-ds-text-field";
// import ODSAutocomplete from "oute-ds-autocomplete";
import { ODSTextField, ODSAutocomplete } from "@src/module/ods";
import classes from "../embed-settings.module.css";

const ModeWidthController = () => {
  const { embedSettings, setEmbedSettings } = useFormPublishContext();

  const unitOptions = [
    { label: "Px", value: "px" },
    { label: "%", value: "%" },
  ];

  const handleDimensionChange = useCallback(
    (field, value) => {
      setEmbedSettings((prev) => ({
        ...prev,
        width: {
          ...prev.width,
          [field]: value,
        },
      }));
    },
    [setEmbedSettings],
  );

  return (
    <div className={classes.dimensionGroup}>
      <label className={classes.label}>Width</label>
      <div className={classes.inputGroup}>
        <ODSTextField
          value={embedSettings.width.value}
          onChange={(e) => handleDimensionChange("value", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "0.375rem 0 0 0.375rem",
              borderRight: "none",
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
          data-testid="width-input"
        />
        <ODSAutocomplete
          options={unitOptions}
          value={unitOptions.find(
            (opt) => opt.value === embedSettings.width.unit,
          )}
          onChange={(event, newValue) =>
            handleDimensionChange("unit", newValue?.value || "px")
          }
          renderInput={(params) => (
            <ODSTextField
              {...params}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "0 0.375rem 0.375rem 0",
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
          data-testid="width-unit-select"
        />
      </div>
    </div>
  );
};

export default ModeWidthController;
