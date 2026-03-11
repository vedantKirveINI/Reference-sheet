import React, {
  useCallback,
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
// import ODSTextField from "oute-ds-text-field";
// import ODSButton from "oute-ds-button";
// import ODSLabel from "oute-ds-label";
import { ODSTextField, ODSButton, ODSLabel } from "@src/module/ods";

import classes from "./index.module.css";
import { getSaveDialogTitle } from "../../../utils/utils";
import { getMode } from "../../canvas/config";
import { MODE } from "../../../constants/mode";

const WorkflowName = forwardRef(
  ({ onSave = () => {}, details = { name: "", description: "" } }, ref) => {
    const [workflowData, setWorkflowData] = useState({
      name: details.name,
      description: details.description,
    });
    const [error, setError] = useState("");
    const [descriptionError, setDescriptionError] = useState("");
    const workflowTextRef = useRef();
    const descriptionTextRef = useRef();
    const saveButtonRef = useRef();
    const assetTypeLowerCase = getSaveDialogTitle(getMode());
    const isToolCanvas = getMode() === MODE.TOOL_CANVAS;

    // Validation function that can be called from parent
    const validateFields = useCallback(() => {
      const nameValid = !!workflowData.name.trim();
      const descriptionValid =
        !isToolCanvas || !!workflowData.description.trim();

      if (!nameValid) {
        setError("Please enter a name");
        workflowTextRef.current?.focus();
        return false;
      }

      if (!descriptionValid) {
        setDescriptionError("Please enter a description for the AI tool");
        descriptionTextRef.current?.focus();
        return false;
      }

      // Clear any existing errors
      setError("");
      setDescriptionError("");
      return true;
    }, [workflowData, isToolCanvas]);

    // Expose validation function to parent
    useImperativeHandle(
      ref,
      () => ({
        validateFields,
        isValid: () => {
          const nameValid = !!workflowData.name.trim();
          const descriptionValid =
            !isToolCanvas || !!workflowData.description.trim();
          return nameValid && descriptionValid;
        },
      }),
      [validateFields, workflowData, isToolCanvas]
    );

    const saveClickHandler = useCallback(() => {
      if (validateFields()) {
        onSave(workflowData);
      }
    }, [validateFields, onSave, workflowData]);

    // Get current validation state
    const isFormValid = () => {
      const nameValid = !!workflowData.name.trim();
      const descriptionValid =
        !isToolCanvas || !!workflowData.description.trim();
      return nameValid && descriptionValid;
    };

    useEffect(() => {
      const listener = (e) => {
        if (e.key.toLowerCase() === "s" && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          e.stopPropagation();
          saveClickHandler();
        }
      };

      document.addEventListener("keydown", listener, false);
      return () => document.removeEventListener("keydown", listener, false);
    }, [saveClickHandler]);

    return (
      <div className={classes["workflow-container"]}>
        <ODSTextField
          className={"black"}
          autoFocus={true}
          value={workflowData.name}
          placeholder={
            isToolCanvas
              ? "Enter AI tool name (e.g., 'Weather Checker', 'Email Sender')"
              : `Enter ${assetTypeLowerCase} name`
          }
          fullWidth={true}
          onChange={(e) => {
            const value = e.target.value.slice(0, 75);
            const isValid = /^[a-zA-Z0-9 _\-.,&+():!]*$/.test(value);
            setError(
              !isValid
                ? "Allowed: letters, numbers, spaces, and - _ . , & + () : !"
                : value.length > 75
                ? "Max 75 characters allowed."
                : ""
            );
            if (isValid) {
              setWorkflowData((prev) => ({ ...prev, name: value }));
            }
          }}
          required={true}
          ref={workflowTextRef}
          onEnter={() => saveButtonRef.current?.click()}
          error={error}
          helperText={error}
          sx={{ marginBottom: "0.8em" }}
          InputProps={{
            endAdornment: (
              <ODSLabel
                variant="subtitle1"
                color="text.secondary"
                data-testid="title-char-count"
              >
                {workflowData?.name?.length}/75
              </ODSLabel>
            ),
          }}
          FormHelperTextProps={{
            "data-testid": "title-error-message",
          }}
          data-testid="title-input"
        />

        <ODSTextField
          className={"black"}
          multiline
          minRows={4}
          value={workflowData.description}
          placeholder={
            isToolCanvas
              ? "Describe what this AI tool does and when the LLM should use it (e.g., 'This tool checks the current weather for any location. Use it when users ask about weather conditions, temperature, or weather forecasts.')"
              : `Enter description ${assetTypeLowerCase}`
          }
          fullWidth={true}
          onChange={(e) => {
            const value = e.target.value.slice(0, 120);
            setWorkflowData((prev) => ({ ...prev, description: value }));

            // Clear description error when user starts typing
            if (isToolCanvas && value.trim() && descriptionError) {
              setDescriptionError("");
            }
          }}
          onEnter={() => saveButtonRef.current?.click()}
          required={isToolCanvas}
          ref={descriptionTextRef}
          error={descriptionError}
          helperText={descriptionError}
          InputProps={{
            endAdornment: (
              <ODSLabel
                variant="subtitle1"
                color="text.secondary"
                data-testid="description-char-count"
              >
                {workflowData?.description?.length}/120
              </ODSLabel>
            ),
          }}
          FormHelperTextProps={{
            "data-testid": "description-error-message",
          }}
          data-testid="description-input"
        />

        <div className={classes["ctas-container"]}>
          <ODSButton
            ref={saveButtonRef}
            variant="black"
            size="large"
            label="Save"
            onClick={saveClickHandler}
            disabled={!isFormValid()}
            data-testid="rename-save-button"
          />
        </div>
      </div>
    );
  }
);

WorkflowName.displayName = "WorkflowName";

export default WorkflowName;
