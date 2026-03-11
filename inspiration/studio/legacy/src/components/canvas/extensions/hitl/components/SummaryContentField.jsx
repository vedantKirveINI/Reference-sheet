"use client";

// import Autocomplete from "oute-ds-autocomplete";
// import Button from "oute-ds-button";
// import Typography from "oute-ds-label";
// import { FormulaBar } from "oute-ds-formula-bar";
import { ODSAutocomplete as Autocomplete, ODSLabel as Typography, ODSFormulaBar as FormulaBar } from "@src/module/ods";
// import Icon from "oute-ds-icon";
import { FieldDescription } from "./FieldDescription";
import { LabelWithTooltip } from "./LabelWithTooltip";

import styles from "./common-fields.module.css";
// import FileList from "./FileList";
import { SUMMARY_CONTENT_TYPES } from "../constant";

export function SummaryContentField({
  summaryContent,
  onContentChange = () => {},
  onSummaryTypeChange = () => {},
  errors,
  variables,
}) {
  return (
    <div className={styles.formSection}>
      <LabelWithTooltip
        htmlFor="summary_content"
        label="Select Content Type"
        required
      />
      <Autocomplete
        options={SUMMARY_CONTENT_TYPES}
        data-testid="summary-content-type"
        value={
          SUMMARY_CONTENT_TYPES.find(
            (type) => type.value === summaryContent?.type
          ) || SUMMARY_CONTENT_TYPES[0]
        }
        fullWidth
        onChange={(event, newValue) => {
          onSummaryTypeChange(newValue?.value);
        }}
        getOptionLabel={(option) => option.label}
        variant="black"
        isOptionEqualToValue={(option, value) => option?.value === value?.value}
        id="summary_content"
      />
      <FieldDescription>
        Choose template to automatically configure button for common scenarios.
      </FieldDescription>
      <LabelWithTooltip
        htmlFor="summary_content"
        label="Summary Content"
        tooltip="A concise summary of what is being reviewed. This will be prominently displayed to the reviewer."
        required
      />
      <FormulaBar
        wrapContent={true}
        placeholder="e.g., Budget request for Q2 – ₹12L"
        variables={variables}
        defaultInputContent={summaryContent?.value?.blocks || []}
        onInputContentChanged={(content) => {
          onContentChange({
            type: "fx",
            blocks: content,
          });
        }}
      />
      <FieldDescription>
        This summary will be prominently displayed to the reviewer. Keep it
        concise but informative.
      </FieldDescription>
      {errors && (
        <Typography className={styles.errorText}>
          Summary content is required
        </Typography>
      )}
    </div>
  );
}
