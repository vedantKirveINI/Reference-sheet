import { useCallback } from "react";
import { useFormPublishContext } from "../../../../../hooks/use-form-publish-context";
// import ODSTextField from "oute-ds-text-field";
// import ODSAutocomplete from "oute-ds-autocomplete";
import { ODSTextField, ODSAutocomplete } from "@src/module/ods";
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
        <ODSTextField
          value={embedSettings.height.value}
          onChange={(e) => handleDimensionChange("value", e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "0.375rem 0 0 0.375rem",
              borderRight: "none",
              "& fieldset": {
                borderColor: "rgba(0,0,0,0.2)",
                borderWidth: "0.75px",
              },
              "&:hover fieldset": {
                borderColor: "rgba(0,0,0,0.2)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(0,0,0,0.2)",
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
          data-testid="height-input"
        />
        <ODSAutocomplete
          options={unitOptions}
          value={unitOptions.find(
            (opt) => opt.value === embedSettings.height.unit,
          )}
          onChange={(event, newValue) =>
            handleDimensionChange("unit", newValue?.value || "%")
          }
          renderInput={(params) => (
            <ODSTextField
              {...params}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "0 0.375rem 0.375rem 0",
                  "& fieldset": {
                    borderColor: "rgba(0,0,0,0.2)",
                    borderWidth: "0.75px",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(0,0,0,0.2)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(0,0,0,0.2)",
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
          data-testid="height-unit-select"
        />
      </div>
    </div>
  );
};

export default ModeHeightController;
