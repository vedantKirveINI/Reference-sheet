// import { ODSLabel as Label } from "@src/module/ods";
// import { FormulaBar } from "@src/module/ods";
// import { default_theme } from "@src/module/ods";
// import { ODSAutocomplete as Autocomplete } from "@src/module/ods";
import { ODSLabel as Label, ODSFormulaBar as FormulaBar, sharedAssets as default_theme, ODSAutocomplete as Autocomplete } from "@src/module/ods";
import classes from "./Configure.module.css";
import TemplatesList from "../../components/TemplatesList";
import { KeyValueTable } from "@src/module/key-value-table";
import { useEffect } from "react";
const BODY_TYPE_OPTIONS = [
  { name: "Text/HTML", value: "Text/HTML" },
  { name: "Template", value: "Template" },
];
const Configure = ({
  variables,
  subject,
  setSubject,
  bodyType,
  setBodyType,
  body,
  setBody,
  state,
  setState,
  workspaceId,
  templateId,
  setTemplateId,
  setValidTabIndices,
}) => {
  useEffect(() => {
    const validationErrors = {
      subject: !subject?.blocks?.length,
    };

    const hasErrors = Object.values(validationErrors).some((error) => error);

    setValidTabIndices((prev) => {
      if (!hasErrors) {
        if (!prev.includes(0)) {
          return [...prev, 0];
        }
        return prev;
      } else {
        return prev.filter((index) => index !== 0);
      }
    });
  }, [subject, body, bodyType, state]);

  return (
    <div className={classes["send-email-container"]}>
      <div className={classes["send-email-label-field-container"]}>
        <span className={classes["label"]}>Subject*</span>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Please type subject here"
          defaultInputContent={subject?.blocks || []}
          onInputContentChanged={(blocks) => setSubject({ type: "fx", blocks })}
        />
      </div>

      <div className={classes["send-email-label-field-container"]}>
        <span className={classes["label"]}>Type</span>
        <Autocomplete
          options={BODY_TYPE_OPTIONS}
          value={BODY_TYPE_OPTIONS?.find((item) => item?.value === bodyType)}
          getOptionLabel={(option) => option?.name || ""}
          textFieldProps={{
            placeholder: "Select email body type",
          }}
          openOnFocus
          variant="black"
          fullWidth
          
          onChange={(e, value) => {
            setBodyType(value?.value);
            setTemplateId(null);
            setState(undefined);
          }}
        />
      </div>

      {bodyType === "Text/HTML" && (
        <div className={classes["send-email-label-field-container"]}>
          <span className={classes["label"]}>Body</span>
          <FormulaBar
            variables={variables}
            wrapContent
            placeholder="Please type body"
            defaultInputContent={body?.blocks || []}
            onInputContentChanged={(blocks) => setBody({ type: "fx", blocks })}
            slotProps={{
              container: {
                style: {
                  minHeight: 100,
                  maxHeight: 300,
                },
              },
            }}
          />
        </div>
      )}

      {bodyType === "Template" && (
        <div className={classes["send-email-label-field-container"]}>
          <span className={classes["label"]}>Select Template</span>
          <TemplatesList
            templateId={templateId}
            workspaceId={workspaceId}
            onChangeTemplate={(template) => {
              setBody(template?.html);
              setTemplateId(template?._id);
              if (template?.inputs) {
                setState(template?.inputs);
              } else {
                setState(undefined);
              }
            }}
          />
        </div>
      )}
      {bodyType === "Template" &&
      templateId &&
      Object?.keys(state || {})?.length ? (
        <div className={classes["send-email-label-field-container"]}>
          <span className={classes["label"]}>State</span>
          <KeyValueTable
            value={state}
            onChange={setState}
            variables={variables}
            question={{}}
            isCreator={false}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Configure;
