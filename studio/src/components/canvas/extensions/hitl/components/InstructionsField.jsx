"use client";

import { ODSLabel as Typography, ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { FieldDescription } from "./FieldDescription";
import { LabelWithTooltip } from "./LabelWithTooltip";
import styles from "./common-fields.module.css";
export function InstructionsField({
  instructions,
  variables,
  onChange,
  error,
}) {
  return (
    <div className={styles.formSection}>
      <LabelWithTooltip
        htmlFor="instructions"
        label="Instructions"
        tooltip="Detailed guidance for the reviewer on what they need to evaluate and how to make a decision."
        required
      />
      {/* <TextField
        id="instructions"
        placeholder="Please review and take action."
        multiline
        rows={4}
        value={instructions}
        onChange={(e) => onChange(e.target.value)}
        error={error}
        fullWidth
        variant="outlined"
      /> */}
      <FormulaBar
        wrapContent={true}
        placeholder="Please review and take action."
        variables={variables}
        defaultInputContent={instructions?.blocks || []}
        onInputContentChanged={(content) => {
          onChange({
            type: "fx",
            blocks: content,
          });
        }}
      />
      <FieldDescription>
        These instructions will be shown to the reviewer. Be specific about what
        they should check and how to make their decision.
      </FieldDescription>
      {error && (
        <Typography className={styles.errorText}>
          Instructions are required
        </Typography>
      )}
    </div>
  );
}
