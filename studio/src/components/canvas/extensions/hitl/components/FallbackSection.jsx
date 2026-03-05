"use client";
// import ODSRadio from "oute-ds-radio";
// import ODSRadioGroup from "oute-ds-radio-group";
// import { ODSSwitch as Switch } from "@src/module/ods";
// import { ODSTextField as TextField } from "@src/module/ods";
// import Typography from "oute-ds-label";
// import { ODSAutocomplete as Autocomplete } from "@src/module/ods";
import { ODSRadio, ODSRadioGroup, ODSSwitch as Switch, ODSTextField as TextField, ODSLabel as Typography, ODSAutocomplete as Autocomplete } from "@src/module/ods";
import { FieldDescription } from "./FieldDescription";
import { LabelWithTooltip } from "./LabelWithTooltip";
import styles from "./FallbackSection.module.css";
export function FallbackSection({
  fallback,
  buttons,
  errors,
  onFallbackChange,
}) {
  return (
    <div className={`${styles.formSection} ${styles.sectionDivider}`}>
      <div className={styles.sectionHeader}>
        <Switch
          id="fallback_enabled"
          data-testid="enable-fallback-toggle"
          checked={fallback?.enabled}
          onChange={(e) =>
            onFallbackChange({
              ...fallback,
              enabled: e.target.checked,
            })
          }
          variant="black"
          labelText="Enable fallback behavior"
        />
      </div>
      <FieldDescription>
        Fallback behavior determines what happens if a reviewer doesn&apos;t
        take action within a specified time period. This prevents workflows from
        getting stuck indefinitely.
      </FieldDescription>

      {fallback?.enabled && (
        <div className={styles.fallbackSection}>
          <Typography variant="body1" className={styles.fallbackDescription}>
            Configure what happens if no action is taken in time
          </Typography>

          {/* Timeout Duration */}
          <div className={styles.timeoutGrid}>
            <div className={styles.timeoutDuration}>
              <LabelWithTooltip
                htmlFor="timeout_duration"
                label="Timeout Duration"
                tooltip="How long to wait for a reviewer response before triggering the fallback action."
                required
              />
              <TextField
                id="timeout_duration"
                type="number"
                data-testid="timeout-duration"
                inputProps={{ min: "1" }}
                value={fallback?.timeout_duration}
                onChange={(e) =>
                  onFallbackChange({
                    ...fallback,
                    timeout_duration: Number.parseInt(e.target.value) || 0,
                  })
                }
                error={errors.timeout_duration}
                fullWidth
                variant="outlined"
                className="black"
              />
              {errors.timeout_duration && (
                <Typography className={styles.errorText}>
                  Timeout duration is required
                </Typography>
              )}
            </div>

            <div className={styles.timeoutUnit}>
              <LabelWithTooltip
                htmlFor="timeout_unit"
                label="Time Unit"
                tooltip="The unit of time for the timeout duration (minutes or hours)."
              />
              <Autocomplete
                data-testid="timeout-unit"
                id="timeout_unit"
                value={fallback?.timeout_unit}
                options={["minutes", "hours"]}
                onChange={(event, newValue) => {
                  onFallbackChange({
                    ...fallback,
                    timeout_unit: newValue,
                  });
                }}
                fullWidth={true}
                getOptionLabel={(option) => option}
                variant="black"
                style={{ width: "16rem" }}
              />
            </div>
          </div>

          {/* Fallback Type */}
          <div className={styles.formSection}>
            <LabelWithTooltip
              htmlFor="fallback_action"
              label="Fallback Action"
              tooltip="What should happen when the timeout is reached."
            />
            <ODSRadioGroup
              value={fallback?.action}
              onChange={(e) => {
                const value = e.target.value;
                onFallbackChange({
                  ...fallback,
                  action: value,
                  ...(value === "kill" && { fallback_value: undefined }),
                });
              }}
            >
              <div className={styles.radioOption}>
                <ODSRadio
                  radioProps={{
                    "data-testid": "auto-trigger-action-radio",
                    value: "auto_trigger",
                    checked: fallback?.action === "auto_trigger",
                  }}
                  labelText="Auto-Trigger with Predefined Button Response"
                  labelSubText="This will simulate as if a specific button was clicked"
                  variant="black"
                  labelProps={{ fontSize: "0.875rem" }}
                  subTextProps={{ fontSize: "0.75rem" }}
                />
              </div>
              <div className={styles.radioOption}>
                <ODSRadio
                  radioProps={{
                    "data-testid": "kill-action-radio",
                    value: "kill",
                    checked: fallback?.action === "kill",
                  }}
                  labelText="Kill the Workflow with Final Status"
                  labelSubText="Ends the flow and shows a kill-screen with error message"
                  variant="black"
                  labelProps={{ fontSize: "0.875rem" }}
                  subTextProps={{ fontSize: "0.75rem" }}
                />
              </div>
            </ODSRadioGroup>

            {/* Fallback Button Selection (only if auto_trigger is selected) */}
            {fallback?.action === "auto_trigger" && (
              <div className={styles.fallbackButtonSelect}>
                <LabelWithTooltip
                  htmlFor="fallback_value"
                  label="Fallback Button"
                  tooltip="Which button action should be automatically triggered after timeout."
                  required
                />
                {/* <FormControl
                  fullWidth
                  variant="outlined"
                  size="small"
                  error={errors?.fallback_value}
                >
                  <InputLabel id="fallback-value-label">
                    Select a button
                  </InputLabel>
                  <Select
                    labelId="fallback-value-label"
                    id="fallback_value"
                    value={fallback?.fallback_value || ""}
                    onChange={(e) =>
                      onFallbackChange({
                        ...fallback,
                        fallback_value: e.target.value,
                      })
                    }
                    label="Select a button"
                  >
                    {buttons
                      ?.filter((button) => button.value) // Filter out buttons with empty values
                      ?.map((button, index) => (
                        <MenuItem key={index} value={button.value}>
                          {button?.label || `Button ${index + 1}`}
                        </MenuItem>
                      ))}
                    {buttons.filter((button) => button.value).length === 0 && (
                      <MenuItem disabled>
                        No valid buttons available. Please add button values
                        first.
                      </MenuItem>
                    )}
                  </Select>
                </FormControl> */}
                <Autocomplete
                  id="fallback_value"
                  data-testid="fallback-value"
                  value={fallback?.fallback_value}
                  options={buttons
                    ?.filter((button) => button.label) // Filter out buttons with empty values
                    ?.map((button) => button.label)}
                  onChange={(event, newValue) => {
                    onFallbackChange({
                      ...fallback,
                      fallback_value: newValue,
                    });
                  }}
                  fullWidth={true}
                  getOptionLabel={(option) => option}
                  variant="black"
                />
                {buttons.filter((button) => button.value).length === 0 && (
                  <Typography className={styles.errorText}>
                    No valid buttons available. Please add button values first.
                  </Typography>
                )}
                <FieldDescription>
                  This button will be automatically triggered after the timeout
                  period
                </FieldDescription>
                {errors?.fallback_value && (
                  <Typography className={styles.errorText}>
                    Fallback button is required
                  </Typography>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
