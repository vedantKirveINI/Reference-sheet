import React, { useState, useEffect, useCallback } from "react";
// import Accordion from "oute-ds-accordion";
// import Typography from "oute-ds-label";
import { ODSAccordion as Accordion, ODSLabel as Typography } from "@src/module/ods";
import { toast } from "sonner";
import styles from "./ConfigScreen.module.css";

// Import modularized components
import { ButtonConfigSection } from "./components/ButtonConfigSection";
import { FallbackSection } from "./components/FallbackSection";
import { BrandingSection } from "./components/BrandingSection";
import { InstructionsField } from "./components/InstructionsField";
import { EditableContentToggle } from "./components/EditableContentToggle";
import { SummaryContentField } from "./components/SummaryContentField";
import AddFiles from "./components/AddFiles";
import storageSDKServices from "../../services/storageSDKServices";

const commonAccordionProps = {
  summaryProps: {
    sx: {
      background: "transparent !important",
      flexDirection: "row-reverse",
      border: "none",
      // padding: "1rem 1.5rem !important",
      height: "auto !important",
      "& .MuiAccordionSummary-content": {
        margin: "0 !important",
        padding: "0 !important",
        alignItems: "center",
      },
    },
  },
  detailsProps: {
    sx: { padding: "1rem !important" },
  },
  sx: {
    "&.Mui-expanded": {
      background: "#fff",
      height: "max-content !important",
      margin: "0 !important",
    },
    padding: "0.5rem",
    border: "none",
    borderBottom: "0.75px solid",
    borderColor: " #CFD8DC",
    borderRadius: "0px !important",
  },
};

export function ConfigScreen({
  config,
  error,
  onConfigChange,
  onButtonChange,
  onAddButton,
  onRemoveButton,
  onFallbackChange,
  onBrandingChange,
  onLogoUpload,
  variables,
  setValidTabIndices,
  validTabIndices,
  setError,
  previewOpen,
  onAddFiles = () => {},
}) {
  const [expanded, setExpanded] = useState(0);
  const [showErrors, setShowErrors] = useState(false);
  const [isRemoving, setIsRemoving] = useState("");

  const removeHandler = useCallback(
    async (id) => {
      try {
        // setIsRemoving(id);
        // const file = config?.files?.find((item) => item.id === id);
        // if (file?.isUploaded) {
        //   await storageSDKServices.getUploadSignedUrl({
        //     filePath: file?.filePath,
        //     op: "delete",
        //   });
        // }
        // setIsRemoving("");
        onConfigChange({
          ...config,
          files: config?.files?.filter((file) => file.id !== id),
        });
      } catch (error) {
        setIsRemoving("");
        toast.error("File Deletion Error", {
          description: "Error deleting file",
        });
      }
    },
    [config, onConfigChange]
  );

  useEffect(() => {
    setShowErrors(validTabIndices.includes(1));
  }, [validTabIndices]);

  // Validate the configuration and update parent component
  useEffect(() => {
    if (!setValidTabIndices) return;
    // Validation rules
    const validationErrors = {
      instructions: !config?.instructions?.blocks?.length,
      summary_content: !config?.summary_content?.value?.blocks?.length,
      buttons: config?.buttons?.some(
        (button) => !button.label || !button.value
      ),
      fallback:
        config?.fallback?.enabled &&
        config?.fallback?.action === "auto_trigger" &&
        !config?.fallback?.fallback_value,
    };

    const hasErrors = Object.values(validationErrors).some((error) => error);

    // Update valid tab indices
    setValidTabIndices((prev) => {
      if (!hasErrors) {
        // If valid, add 1 to the array if not already there
        if (!prev.includes(1)) {
          return [...prev, 1];
        }
        return prev;
      } else {
        // If not valid, remove 1 from the indices
        return prev.filter((index) => index !== 1);
      }
    });

    // // Update error messages
    setError((prev) => {
      const errorMessages = [];

      if (validationErrors.instructions) {
        errorMessages.push("Instructions are required");
      }

      if (validationErrors.summary_content) {
        errorMessages.push("Summary content is required");
      }

      if (validationErrors.buttons) {
        errorMessages.push("All buttons must have labels");
      }

      if (validationErrors.fallback) {
        errorMessages.push("Fallback button is required");
      }

      return {
        ...prev,
        1: errorMessages,
      };
    });
  }, [config, setValidTabIndices, setError]);

  return (
    <div className={styles.mainContent}>
      <Accordion
        data-testid={"approval-logic-section"}
        title={
          <Typography variant="body1" className={styles.sectionTitle}>
            Set up your approval logic and decision options.
          </Typography>
        }
        content={
          <div className={styles.formSection}>
            {/* Instructions */}
            <InstructionsField
              variables={variables}
              instructions={config?.instructions}
              onChange={(value) =>
                onConfigChange((prevConfig) => ({
                  ...prevConfig,
                  instructions: value,
                }))
              }
              error={showErrors && !config?.instructions?.blocks?.length}
            />

            {/* Summary Content */}
            <SummaryContentField
              variables={variables}
              summaryContent={config?.summary_content}
              onContentChange={(value) =>
                onConfigChange((prevConfig) => ({
                  ...prevConfig,
                  summary_content: {
                    ...prevConfig?.summary_content,
                    value,
                  },
                }))
              }
              onSummaryTypeChange={(value) =>
                onConfigChange((prevConfig) => ({
                  ...prevConfig,
                  summary_content: {
                    ...prevConfig?.summary_content,
                    type: value,
                  },
                }))
              }
              errors={
                showErrors && !config?.summary_content?.value?.blocks?.length
              }
            />

            {/* Editable Content Toggle */}
            <EditableContentToggle
              editable={config?.summary_content?.editable}
              onChange={(value) =>
                onConfigChange({
                  ...config,
                  summary_content: {
                    ...config?.summary_content,
                    editable: value,
                  },
                })
              }
            />
            {!previewOpen && (
              <AddFiles
                files={config?.files}
                previewOpen={previewOpen}
                onAddFiles={onAddFiles}
                onFileReorder={(files) => {
                  onConfigChange({
                    ...config,
                    files,
                  });
                }}
                variables={variables}
                isRemoving={isRemoving}
                onFileRemove={removeHandler}
                onLinkTypeChange={(id, type) => {
                  onConfigChange({
                    ...config,
                    files: config?.files?.map((file) =>
                      file.id === id ? { ...file, type } : file
                    ),
                  });
                }}
                onLinkContentChanged={(id, content) => {
                  onConfigChange({
                    ...config,
                    files: config?.files?.map((file) =>
                      file.id === id
                        ? { ...file, url: { type: "fx", blocks: content } }
                        : file
                    ),
                  });
                }}
              />
            )}
          </div>
        }
        expanded={expanded === 0}
        onChange={() => setExpanded(expanded === 0 ? -1 : 0)}
        {...commonAccordionProps}
      />
      <Accordion
        data-testid={"button-config-section"}
        title={
          <Typography variant="body1" className={styles.sectionTitle}>
            Button Configuration
          </Typography>
        }
        content={
          <ButtonConfigSection
            buttons={config?.buttons}
            onButtonChange={onButtonChange}
            onAddButton={onAddButton}
            onRemoveButton={onRemoveButton}
          />
        }
        expanded={expanded === 1}
        onChange={() => setExpanded(expanded === 1 ? -1 : 1)}
        {...commonAccordionProps}
      />

      <Accordion
        data-testid={"fallback-behavior-section"}
        title={
          <Typography variant="body1" className={styles.sectionTitle}>
            Fallback Behavior (Optional)
          </Typography>
        }
        content={
          <FallbackSection
            fallback={config?.fallback}
            buttons={config?.buttons}
            errors={
              showErrors
                ? {
                    fallback_value: !config?.fallback?.fallback_value,
                    timeout_duration: !config?.fallback?.timeout_duration,
                  }
                : {}
            }
            onFallbackChange={onFallbackChange}
          />
        }
        expanded={expanded === 2}
        onChange={() => setExpanded(expanded === 2 ? -1 : 2)}
        {...commonAccordionProps}
      />
      <Accordion
        data-testid={"brand-theme-section"}
        title={
          <Typography variant="body1" className={styles.sectionTitle}>
            Brand Theme (Optional - Premium Accounts)
          </Typography>
        }
        content={
          <BrandingSection
            branding={config?.branding}
            onBrandingChange={onBrandingChange}
            onLogoUpload={onLogoUpload}
            errors={showErrors ? error[1] : null}
          />
        }
        expanded={expanded === 3}
        onChange={() => setExpanded(expanded === 3 ? -1 : 3)}
        {...commonAccordionProps}
      />
    </div>
  );
}
