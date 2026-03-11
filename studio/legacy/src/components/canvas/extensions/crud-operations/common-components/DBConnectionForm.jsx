import React, { useState, useCallback, useMemo } from "react";
import isNil from "lodash/isNil";
import Label from "oute-ds-label";
import Accordion from "oute-ds-accordion";
import LoadingButton from "oute-ds-loading-button";
import ODSButton from "oute-ds-button";
import { DATABASE_CONFIGS } from "../utils/databaseConfig";
import { connectionSDKServices } from "../../../services/dbConnectionSDKServices";
import DBRenderField from "./DBRenderField";

import styles from "./DBConnectionForm.module.css";

const DBConnectionForm = ({
  databaseType,
  onSave = () => {},
  onCancel = () => {},
  workspaceId,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formValue, setFormValue] = useState({});
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [canSave, setCanSave] = useState(false);

  const config = useMemo(
    () => DATABASE_CONFIGS[databaseType] || {},
    [databaseType]
  );
  const formConfig = useMemo(() => config.formConfig || [], [config]);

  // Separate fields into basic and advanced
  const basicFields = useMemo(
    () => formConfig.filter((f) => !f.is_advanced),
    [formConfig]
  );
  const advancedFields = useMemo(
    () => formConfig.filter((f) => f.is_advanced),
    [formConfig]
  );

  const handleFieldChange = useCallback(({ field, fieldValue }) => {
    setFormValue((prev) => ({
      ...prev,
      [field.key]: {
        ...field,
        value: fieldValue,
      },
    }));
  }, []);

  const handleTest = useCallback(async () => {
    setLoading(true);
    setTestResult(null);
    setCanSave(false);

    try {
      const payload = {
        state: {},
        db_config: { db_type: databaseType, configs: Object.values(formValue) },
        options: {},
      };
      await connectionSDKServices.testConnection(payload);
      setTestResult({ success: true, message: "Connection test successful!" });
      setCanSave(true);
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message || "Connection test failed.",
      });
      setCanSave(false);
    } finally {
      setLoading(false);
    }
  }, [databaseType, formValue]);

  const handleSave = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        configs: Object.values(formValue),
        workspace_id: workspaceId,
        db_type: databaseType,
        name: formValue?.name?.value || "",
      };
      const response = await connectionSDKServices.save(payload);

      onSave(response?.result);
    } catch (error) {
      setTestResult({
        success: false,
        message: error.message || "Failed to save connection.",
      });
    } finally {
      setLoading(false);
    }
  }, [formValue, workspaceId, databaseType, onSave]);

  // Dynamic validation based on config
  const isFormValid = useMemo(() => {
    if (!formConfig || formConfig.length === 0) return false;

    const requiredFields = formConfig.filter((f) => f.required);
    return requiredFields.every((field) => {
      const fieldValue = formValue?.[field.key]?.value;

      if (isNil(fieldValue) || fieldValue === "") {
        return false;
      }
      return true;
    });
  }, [formConfig, formValue]);

  return (
    <div className={styles.form_container}>
      <Label variant="h6" fontWeight="600" required>
        Connection Configuration
      </Label>

      {/* Basic Fields */}
      {basicFields.map((field) => (
        <DBRenderField
          key={field.key}
          fieldConfig={field}
          formValue={formValue}
          handleFieldChange={handleFieldChange}
        />
      ))}

      {/* Advanced Fields Accordion (only if advanced fields exist) */}
      {advancedFields.length > 0 && (
        <Accordion
          title={
            <Label variant="body1" fontWeight="600">
              Advanced Options
            </Label>
          }
          content={
            <div className={styles.accordion_content}>
              {advancedFields.map((field) => (
                <DBRenderField
                  key={field.key}
                  fieldConfig={field}
                  formValue={formValue}
                  handleFieldChange={handleFieldChange}
                />
              ))}
            </div>
          }
          expanded={showAdvanced}
          onChange={() => setShowAdvanced(!showAdvanced)}
          sx={{
            borderColor: "#CFD8DC",
            borderRadius: "0px !important",
          }}
          summaryProps={{
            sx: {
              background: "#fff",
              height: "max-content !important",
              border: "none",
              flexDirection: "row",
              padding: "0.5rem 1.5rem !important",
              "&.Mui-expanded": {
                background: "rgba(33, 33, 33, 0.02)",
              },
            },
          }}
          detailsProps={{
            sx: {
              padding: "1.5rem",
              boxSizing: "border-box",
              height: "max-content",
              border: "none",
              background: "rgba(33, 33, 33, 0.02)",
            },
          }}
        />
      )}

      {/* Action Section with TEST and SAVE buttons */}
      <div
        className={styles.footer_container}
        data-testid="db-connection-form-actions"
      >
        {testResult && (
          <div
            className={`${styles.test_result_container}
              ${testResult.success ? styles.success : styles.error}`}
            data-testid="db-connection-test-result"
          >
            {testResult.message}
          </div>
        )}

        <div className={styles.button_container}>
          <ODSButton
            label="CANCEL"
            variant="black-outlined"
            onClick={onCancel}
            disabled={loading}
            data-testid="db-connection-cancel-button"
          />
          <div className={styles.action_buttons_container}>
            <LoadingButton
              label="TEST"
              variant="black-outlined"
              onClick={handleTest}
              loading={loading}
              disabled={loading || !isFormValid}
              data-testid="db-connection-test-button"
            />
            <LoadingButton
              label="SAVE"
              variant="black"
              onClick={handleSave}
              loading={loading}
              disabled={!canSave || loading || !isFormValid}
              data-testid="db-connection-save-button"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DBConnectionForm;
