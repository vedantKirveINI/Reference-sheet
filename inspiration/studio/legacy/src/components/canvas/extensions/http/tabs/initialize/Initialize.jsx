import React, { useEffect } from "react";
// import Radio from "oute-ds-radio";
// import RadioGroup from "oute-ds-radio-group";
// import Label from "oute-ds-label";
// import { FormulaBar } from "oute-ds-formula-bar";
import { ODSRadio as Radio, ODSRadioGroup as RadioGroup, ODSLabel as Label, ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { methodOptions } from "../../utils";
import {
  addIndices,
  removeIndicesStartingFromIndex,
} from "../../../extension-utils";
import { HTTP_ERRORS } from "../../../../utils/errorEnums";

const Initialize = ({
  method,
  url,
  onMethodChange,
  onURLChanged,
  variables,
  formulaBarRef,
  setValidTabIndices,
  setErrorMessages,
}) => {
  useEffect(() => {
    if (!url?.text?.trim() && !url?.blocks?.length) {
      setErrorMessages((prev) => {
        if (prev[0]?.includes(HTTP_ERRORS.INVALID_URL)) return prev;
        return {
          ...prev,
          0: [HTTP_ERRORS.INVALID_URL],
        };
      });
      setValidTabIndices((prev) => removeIndicesStartingFromIndex(prev, 0));
    } else {
      setErrorMessages((prev) => {
        if (prev[0]?.includes(HTTP_ERRORS.INVALID_URL)) {
          return prev[0].filter((item) => item !== HTTP_ERRORS.INVALID_URL);
        }
        return prev;
      });
      setValidTabIndices((prev) => addIndices(prev, [0]));
    }
  }, [
    formulaBarRef,
    setErrorMessages,
    setValidTabIndices,
    url?.blocks?.length,
    url?.text,
  ]);
  useEffect(() => {
    // Adding setTimeout to avoid the variables issue because the after autosave we get the variables
    if (formulaBarRef?.current) {
      setTimeout(() => {
        formulaBarRef?.current?.focus(true);
      }, 200);
    }
  }, [formulaBarRef]);

  return (
    <div
      style={{
        display: "grid",
        gridAutoFlow: "row",
        gridAutoRows: "max-content",
        gap: "2rem",
        padding: "1.5rem",
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        // gridTemplateRows: "1fr auto auto",
      }}
    >
      <div data-testid="method-container">
        <Label
          sx={{
            paddingBottom: "0.5rem",
          }}
        >
          Select Method
        </Label>
        <Label variant="subtitle2" sx={{ color: "#607D8B" }}>
          Choose the HTTP method that best suits your API request.
        </Label>
        <RadioGroup
          value={method}
          onChange={onMethodChange}
          row
          sx={{
            gap: "1.75rem",
            paddingTop: "1.5rem",
          }}
        >
          {methodOptions.map((data, index) => (
            <Radio
              key={`${data}_${index}`}
              labelText={data}
              formControlLabelProps={{
                value: data,
                sx: {
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: 0,
                  paddingRight: "0.75rem",
                  border: "1.5px solid transparent",
                  ...(method === data && {
                    borderRadius: "0.375rem",
                    borderColor: "#000",
                    background: "rgba(33, 33, 33, 0.12)",
                  }),
                  "& .Mui-checked": {
                    color: "#000 !important",
                  },
                },
              }}
              radioProps={{
                "data-testid": `http-initialize-method-${data?.toLowerCase()}`,
              }}
              labelProps={{
                variant: "body1",
              }}
            />
          ))}
        </RadioGroup>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div>
          <Label
            sx={{
              paddingBottom: "0.5rem",
              "&::after": {
                content: '"*"',
                color: "error.main",
                marginLeft: "2px",
              },
            }}
          >
            URL
          </Label>
          <Label variant="subtitle2" sx={{ color: "#607D8B" }}>
            Enter the endpoint URL for your API request.
          </Label>
        </div>
        <FormulaBar
          ref={formulaBarRef}
          slotProps={{
            content: { "data-testid": "http-initialize-url-input" },
          }}
          placeholder="Enter URL or paste your CURL here..."
          onInputContentChanged={onURLChanged}
          defaultInputContent={url?.blocks?.slice()}
          variables={variables}
          style={{ minWidth: "16rem", width: "100%" }}
        />
      </div>
    </div>
  );
};

export default Initialize;
