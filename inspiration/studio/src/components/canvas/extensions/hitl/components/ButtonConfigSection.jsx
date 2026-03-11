"use client";
// import { ODSButton as Button } from "@src/module/ods";
// import Typography from "oute-ds-label";
// import { ODSTextField as TextField } from "@src/module/ods";
// import { ODSAutocomplete as Autocomplete } from "@src/module/ods";
// import { ODSIcon as Icon } from '@src/module/ods';
import { ODSButton as Button, ODSLabel as Typography, ODSTextField as TextField, ODSAutocomplete as Autocomplete, ODSIcon as Icon } from "@src/module/ods";
import { AnimatePresence, motion } from "framer-motion";
import { FieldDescription } from "./FieldDescription";
import { LabelWithTooltip } from "./LabelWithTooltip";
import styles from "./ButtonConfigSection.module.css";

export function ButtonConfigSection({
  buttons,
  onButtonChange,
  onAddButton,
  onRemoveButton,
}) {
  // Define color options for Autocomplete
  const colorOptions = [
    { label: "Green", value: "green" },
    { label: "Red", value: "red" },
    { label: "Blue", value: "blue" },
    { label: "Orange", value: "orange" },
    { label: "Gray", value: "gray" },
  ];

  // Simplify the label change handler to avoid race conditions
  const handleLabelChange = (index, labelValue) => {
    // Just call onButtonChange once and let the parent handle both label and value updates
    onButtonChange(index, "label", labelValue);
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.sectionHeader}>
        <LabelWithTooltip
          htmlFor="button_config"
          label="Button Configuration"
          tooltip="Define the action buttons that will be shown to the reviewer."
        />
        <Button
          variant="black-outlined"
          data-testid="add-button-config"
          onClick={onAddButton}
          startIcon={
            <Icon
              outeIconName="OUTEAddIcon"
              outeIconProps={{ sx: { color: "#212121" } }}
            />
          }
        >
          Add Button
        </Button>
      </div>
      <FieldDescription>
        Configure the buttons that will be shown to the reviewer. Each button
        needs a label and a color. The label will be used as the internal value.
      </FieldDescription>

      <AnimatePresence>
        {buttons?.map((button, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.buttonCard}>
              <div
                className={styles.buttonCardContent}
                data-testid={`button-card-${index}`}
              >
                <div className={styles.buttonGrid}>
                  <div className={styles.buttonLabelField}>
                    <div
                      htmlFor={`button_label_${index}`}
                      className={styles.fieldLabel}
                    >
                      Label <span className={styles.required}>*</span>
                    </div>
                    <TextField
                      id={`button_label_${index}`}
                      value={button.label}
                      data-testid={`button-label-${index}`}
                      onChange={(e) => handleLabelChange(index, e.target.value)}
                      error={!button.label}
                      fullWidth
                      variant="outlined"
                      className="black"
                      helperText={
                        !button.label ? `button label is required` : ""
                      }
                      placeholder="Text shown on the button to the reviewer"
                    />
                  </div>
                  <div className={styles.buttonColorField}>
                    <div
                      htmlFor={`button_color_${index}`}
                      className={styles.fieldLabel}
                    >
                      Color
                    </div>
                    <Autocomplete
                      id={`button_color_${index}`}
                      data-testid={`button-color-${index}`}
                      options={colorOptions}
                      value={
                        colorOptions.find(
                          (option) => option.value === button.color
                        ) || null
                      }
                      onChange={(event, newValue) => {
                        onButtonChange(
                          index,
                          "color",
                          newValue ? newValue.value : "gray"
                        );
                      }}
                      getOptionLabel={(option) => option.label}
                      textFieldProps={{
                        placeholder: "Select a Color.",
                      }}
                      variant="black"
                    />
                  </div>
                  <div className={styles.buttonDeleteField}>
                    <Icon
                      outeIconName="OUTETrashIcon"
                      onClick={() => onRemoveButton(index)}
                      outeIconProps={{
                        disabled: buttons?.length <= 2,
                        className: styles.deleteButton,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {buttons?.length <= 2 && (
        <Typography variant="body2" className={styles.minButtonsText}>
          Minimum 2 buttons required
        </Typography>
      )}
    </div>
  );
}
