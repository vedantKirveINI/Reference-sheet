"use client";

// import Autocomplete from "oute-ds-autocomplete";
import { ODSAutocomplete as Autocomplete } from "@src/module/ods";
import { FieldDescription } from "./FieldDescription";
import { LabelWithTooltip } from "./LabelWithTooltip";
import styles from "./common-fields.module.css";
import { useEffect } from "react";

export function TemplateTypeField({ templateType, onChange, error }) {
  // Define template options
  const templateOptions = [
    { label: "Approval", value: "approval" },
    { label: "Categorization", value: "categorization" },
    { label: "Escalation", value: "escalation" },
  ];

  useEffect(() => {
    if (!templateType) {
      onChange({ target: { value: "approval" } });
    }
  });
  // Find the current option based on templateType
  const currentOption =
    templateOptions.find((option) => option.value === templateType) || null;

  return (
    <div className={styles.formSection}>
      <LabelWithTooltip
        htmlFor="template_type"
        label="Template Type"
        tooltip="Pre-configured templates with different button sets for common approval scenarios."
        required
      />
      <Autocomplete
        id="template_type"
        options={templateOptions}
        value={currentOption}
        onChange={(event, newValue) => {
          onChange({ target: { value: newValue ? newValue.value : "" } });
        }}
        fullWidth={true}
        getOptionLabel={(option) => option.label}
        variant="black"
        textFieldProps={{
          "data-test-id": "template-type",
          error,
          helperText: error ? "Template selection is required" : "",
          placeholder: "Please select a template",
        }}
      />
      <FieldDescription>
        Choose a template to automatically configure buttons for common
        scenarios. Approval has Approve/Reject buttons, Categorization has Stage
        1/2/3, and Escalation has Escalate/Forward/Defer.
      </FieldDescription>
    </div>
  );
}
