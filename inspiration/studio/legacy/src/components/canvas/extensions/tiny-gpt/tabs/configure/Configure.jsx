import React, { useEffect } from "react";
import { cloneDeep, isEmpty } from "lodash";
// import Label from "oute-ds-label";
// import { FormulaBar } from "oute-ds-formula-bar";
// import default_theme from "oute-ds-shared-assets";
import { ODSLabel as Label, ODSFormulaBar as FormulaBar, sharedAssets as default_theme } from "@src/module/ods";
import classes from "./Configure.module.css";
import InputGridV2 from "@oute/oute-ds.molecule.input-grid-v2";

const Configure = ({
  format = [],
  variables,
  persona,
  setPersona,
  query,
  setQuery,
  onGridDataChange = () => {},
  setValidTabIndices,
  setError,
}) => {
  useEffect(() => {
    const isPersonaValid = persona
      ? persona?.blocks?.length
        ? true
        : false
      : false;
    const isQueryValid = query ? (query?.blocks?.length ? true : false) : false;
    const isFormatValid = !isEmpty(format?.[0]?.schema?.[0]?.key)
      ? true
      : false;

    const isValid = isPersonaValid && isQueryValid && isFormatValid;
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
      0: isValid ? [] : ["Please fill all required fields"],
    }));
  }, [persona, query, format, setValidTabIndices, setError]);

  return (
    <div className={classes["tiny-gpt-container"]}>
      <div
        className={classes["tiny-gpt-label-field-container"]}
        data-testid="tiny-gpt-persona-container"
      >
        <Label
          variant="subtitle2"
          color={default_theme.palette?.grey["A100"]}
          data-testid="tiny-gpt-persona-label"
          required
        >
          Persona
        </Label>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Please enter persona"
          defaultInputContent={persona?.blocks || []}
          onInputContentChanged={(blocks) => setPersona({ type: "fx", blocks })}
          slotProps={{
            container: { "data-testid": "tiny-gpt-persona-field" },
          }}
        />
      </div>
      <div
        className={classes["tiny-gpt-label-field-container"]}
        data-testid="tiny-gpt-query-container"
      >
        <Label
          variant="subtitle2"
          color={default_theme.palette?.grey["A100"]}
          data-testid="tiny-gpt-query-label"
          required
        >
          Query
        </Label>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Please enter query"
          defaultInputContent={query?.blocks || []}
          onInputContentChanged={(blocks) => setQuery({ type: "fx", blocks })}
          slotProps={{ container: { "data-testid": "tiny-gpt-query-field" } }}
        />
      </div>
      <div
        className={classes["tiny-gpt-label-field-container"]}
        data-testid="tiny-gpt-output-format-container"
      >
        <Label
          variant="subtitle2"
          color={default_theme.palette?.grey["A100"]}
          data-testid="tiny-gpt-output-format-label"
          required
        >
          Output Format
        </Label>
        <InputGridV2
          hideHeaderAndMap={true}
          variables={variables}
          isValueMode={false}
          onGridDataChange={onGridDataChange}
          initialValue={cloneDeep(format)}
        />
      </div>
    </div>
  );
};
export default Configure;
