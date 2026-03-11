"use client";

// import Switch from "oute-ds-switch";
// import Checkbox from "oute-ds-checkbox";
import { ODSCheckbox as Checkbox } from "@src/module/ods";
// import { FieldDescription } from "./FieldDescription";
// import { LabelWithTooltip } from "./LabelWithTooltip";
import styles from "./common-fields.module.css";

export function EditableContentToggle({ editable, onChange }) {
  return (
    <div className={styles.formSection}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {/* <Switch
          id="editable"
          data-testid="allow-content-editing-toggle"
          checked={editable}
          onChange={(e) => onChange(e.target.checked)}
          variant="black"
        /> */}
        <Checkbox
          checked={editable}
          labelText="Allow reviewers to edit the summary content"
          variant="black"
          onChange={(e) => onChange(e.target.checked)}
          data-testid="allow-content-editing-toggle"
          labelProps={{ variant: "body1" }}
        />
        {/* <LabelWithTooltip
          htmlFor="editable"
          label="Allow reviewers to edit the summary content"
          tooltip="When enabled, reviewers can modify the content before making a decision."
        /> */}
      </div>
      {/* <FieldDescription>
        If enabled, reviewers can edit the content before approving or
        rejecting. This is useful for making minor corrections without sending
        it back.
      </FieldDescription> */}
    </div>
  );
}
