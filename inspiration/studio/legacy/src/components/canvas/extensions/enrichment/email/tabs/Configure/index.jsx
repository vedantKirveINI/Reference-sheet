import React, { useCallback, useEffect } from "react";
import { configureFields } from "../../fieldConfig";
// import { FormulaBar } from "oute-ds-formula-bar";
// import ODSLabel from "oute-ds-label";
import { ODSFormulaBar as FormulaBar, ODSLabel } from "@src/module/ods";
import styles from "./Configure.module.css";
import { ENRICHMENT_ERRORS } from "../../../../../utils/errorEnums";
import { getRequiredFieldsMissing } from "../../../utils";

const REQUIRED_FIELDS = configureFields.filter((field) => field.required);

function Configure({
  variables,
  enrichmentData,
  setErrorMessages,
  setValidTabIndices,
  setEnrichmentData,
}) {
  const onFieldChange = useCallback(
    ({ key, value }) => {
      setEnrichmentData((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setEnrichmentData]
  );

  useEffect(() => {
    if (enrichmentData) {
      const requiredFieldsMissing = getRequiredFieldsMissing({
        enrichmentData,
        requiredFields: REQUIRED_FIELDS,
      });

      if (requiredFieldsMissing.length > 0) {
        const errors = requiredFieldsMissing.map((field) => {
          if (field.key === "domain") {
            return ENRICHMENT_ERRORS.COMPANY_DOMAIN_MISSING;
          }
          if (field.key === "fullName") {
            return ENRICHMENT_ERRORS.FULL_NAME_MISSING;
          }
          return "";
        });

        setErrorMessages((prev) => ({ ...prev, 0: errors }));
        setValidTabIndices([]);
      } else {
        setErrorMessages((prev) => ({ ...prev, 0: [] }));
        setValidTabIndices([0]);
      }
    }
  }, [enrichmentData, setErrorMessages, setValidTabIndices]);

  return (
    <div className={styles.container}>
      {configureFields.map((field) => (
        <div key={field.key} className={styles.inputContainer}>
          <ODSLabel variant="body1" required={field.required}>
            {field.label}
          </ODSLabel>
          <FormulaBar
            variables={variables}
            wrapContent={true}
            placeholder={field.placeholder}
            defaultInputContent={enrichmentData?.[field.key]?.blocks || []}
            onInputContentChanged={(blocks) => {
              onFieldChange({ key: field.key, value: { type: "fx", blocks } });
            }}
          />
          <ODSLabel
            variant="subtitle2"
            color="#607D8B"
            sx={{ marginLeft: "0.625rem" }}
          >
            {field.description}
          </ODSLabel>
        </div>
      ))}
    </div>
  );
}

export default Configure;
