import React from "react";
import commonClasses from "../common.module.css";

// import ODSTextField from "oute-ds-text-field";
import { ODSTextField } from "@src/module/ods";

export const TriggerTab = ({ triggerData, onTriggerDataChange }) => {
  return (
    <div
      className={[
        commonClasses["tabs-container-padding"],
        commonClasses["tabs-settings-container"],
      ].join(" ")}
    >
      <div className={commonClasses["tabs-settings-container"]}>
        <h2
          aria-label="Trigger Subject Label"
          className={commonClasses["tabs-autocomplete-label"]}
        >
          Subject
        </h2>
        <ODSTextField
          value={triggerData.event_src}
          onChange={(e) => {
            onTriggerDataChange("event_src", e.target.value);
          }}
          multiline={false}
          required={true}
          sx={{ width: "100%" }}
        />
      </div>
      <div className={commonClasses["tabs-settings-container"]}>
        <h2
          aria-label="Trigger Subject Label"
          className={commonClasses["tabs-autocomplete-label"]}
        >
          Predicate
        </h2>
        <ODSTextField
          value={triggerData.event_type}
          onChange={(e) => {
            onTriggerDataChange("event_type", e.target.value);
          }}
          multiline={false}
          required={true}
          sx={{ width: "100%" }}
        />
      </div>
    </div>
  );
};
