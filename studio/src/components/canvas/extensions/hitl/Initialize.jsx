// import Typography from "oute-ds-label";
import { ODSLabel as Typography } from "@src/module/ods";
import { TemplateTypeField } from "./components/TemplateTypeField";
import styles from "./Initialize.module.css";
import { useEffect } from "react";

export function Initialize({
  templateType,
  error,
  onTemplateChange,
  setError,
  setValidTabIndices,
}) {
  useEffect(() => {
    const isValid = !!templateType;

    setValidTabIndices((prev) => {
      if (isValid) {
        if (!prev.includes(0)) {
          return [...prev, 0];
        }
        return prev;
      } else {
        return prev.filter((index) => index !== 0);
      }
    });
    setError((prev) => ({
      ...prev,
      0: isValid ? [] : ["Please select a template to continue"],
    }));
  }, [templateType, setValidTabIndices, setError]);
  return (
    <div className={styles.initializeScreen}>
      <Typography variant="body1" className={styles.subtitle}>
        Start by selecting a template for your approval workflow.
      </Typography>

      <div className={styles.formContainer}>
        <TemplateTypeField
          templateType={templateType}
          onChange={onTemplateChange}
          error={error && !templateType}
        />
      </div>
    </div>
  );
}
