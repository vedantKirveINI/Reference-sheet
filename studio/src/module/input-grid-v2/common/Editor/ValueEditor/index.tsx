import React, { useEffect, useRef, useState } from "react";
import { FormulaBar, ODSTextField, ODSAutocomplete } from "@src/module/ods";
const INVALID_VALUE = ["", null, undefined];

function ValueEditor({
  value,
  onChange,
  onBlur,
  variables,
  variant = "black",
  showFxCell = true,
  typeValue = "string",
  hideBorder = false,
}) {
  const [val, setVal] = useState(value);
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current) {
      let timeout = setTimeout(() => {
        if (showFxCell) {
          editorRef.current.focus(true);
        } else {
          editorRef.current.focus();
        }
      }, 10);

      return () => {
        clearTimeout(timeout);
      };
    }
  }, []);

  useEffect(() => {
    if (!INVALID_VALUE.includes(val)) {
      onChange(val);
    }
  }, [val]);

  if (showFxCell) {
    return (
      <FormulaBar
        hideBorders
        ref={editorRef}
        wrapContent={true}
        variables={variables}
        defaultInputContent={value?.blocks}
        placeholder="Please enter value"
        popperProps={{ className: "ag-custom-component-popup" }}
        onInputContentChanged={(fxUpdatedVal, fxUpdatedValStr) => {
          onChange({
            type: "fx",
            blocks: fxUpdatedVal,
            blockStr: fxUpdatedValStr,
          });
        }}
        onBlur={onBlur}
        variant={variant}
      />
    );
  }

  if (typeValue === "boolean") {
    return (
      <div tabIndex={0} style={{ height: "100%" }} onBlur={onBlur}>
        <ODSAutocomplete
          openOnFocus
          variant={variant}
          value={val ? "True" : "False"}
          fullWidth
          style={({
            minWidth: "100%",
            height: "100%",

            ".MuiInputBase-root": {
              height: "100%",
            },
          })}
          textFieldProps={{
            style: {
              height: "100%",
            },
          }}
          options={["True", "False"]}
          onChange={(e, v) => {
            setVal(v === "True");
          }}
          hideBorder={!hideBorder}
          ref={editorRef}
        />
      </div>
    );
  }

  return (
    <ODSTextField
      fullWidth
      autoFocus
      className={variant}
      onBlur={onBlur}
      multiline={!["number", "int"].includes(typeValue)}
      maxRows={5}
      type={["number", "int"].includes(typeValue) ? "number" : "text"}
      value={val}
      onChange={(e) => {
        const fieldValue = e.target.value;

        setVal(
          ["number", "int"].includes(typeValue) && fieldValue !== ""
            ? Number(fieldValue)
            : fieldValue
        );
      }}
      hideBorder={!hideBorder}
      ref={editorRef}
    />
  );
}

export default ValueEditor;
