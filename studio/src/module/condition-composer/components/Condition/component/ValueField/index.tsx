import { FormulaBar, ODSTextField } from "@src/module/ods";
import React, { memo } from "react";
import SheetCountryPicker, {
  CountryDetails,
} from "@oute/oute-sds.molecule.country-picker";
import { countries } from "@oute/oute-ds.core.constants";

const valueFieldClassName = "border border-[#CFD8DC] min-w-48 flex-1 box-border rounded-md bg-white min-h-11";

function ValueField({ data, variables, schema, colKey, onFieldChangeHandler }) {
  const { value } = data || {};
  const currColumn = schema.find((info) => info.name === colKey);

  const {
    componentProps = {},
    component: ValueComp,
    useCustomComponent = false,
    type = "",
  } = currColumn || {};

  if (useCustomComponent && type === "PHONE_NUMBER") {
    if (["countryNumber", "countryCode"].includes(data?.nested_key)) {
      let defaultValue = {};
      if (value) {
        Object.values(countries).forEach((country) => {
          if (country[data?.nested_key] === value) {
            defaultValue = country;
          }
        });
      }
      return (
        <div className={valueFieldClassName}>
          <SheetCountryPicker
            value={defaultValue || {}}
            hideBorders
            onChange={(val: CountryDetails) => {
              onFieldChangeHandler({
                property: "value",
                newValue: val[data?.nested_key] || val.countryCode,
              });
            }}
          />
        </div>
      );
    }

    return (
      <div className={valueFieldClassName}>
        <ODSTextField
          hideBorders
          fullWidth
          placeholder="Enter Value"
          type="number"
          defaultValue={value || ""}
          onChange={(e) => {
            onFieldChangeHandler({
              property: "value",
              newValue: e.target.value,
            });
          }}
        />
      </div>
    );
  }

  return (
    <>
      {ValueComp ? (
        <div className={`${valueFieldClassName} overflow-hidden flex`}>
          <ValueComp
            placeholder="Enter Value"
            {...componentProps}
            hideBorders
            defaultValue={value ?? ""}
            onChange={(val: any) => {
              onFieldChangeHandler({
                property: "value",
                newValue: val,
              });
            }}
          />
        </div>
      ) : (
        <div className={valueFieldClassName} data-testid="filter-value-input">
          <FormulaBar
            hideBorders
            defaultInputContent={value?.blocks || []}
            variables={variables}
            wrapContent={true}
            placeholder="Enter Value"
            slotProps={{
              container: {
                className: "max-h-40 overflow-auto",
              },
            }}
            onInputContentChanged={(updatedValue, updatedValueStr) => {
              onFieldChangeHandler({
                property: "value",
                newValue: {
                  type: "fx",
                  blocks: updatedValue,
                },
              });

              onFieldChangeHandler({
                property: "valueStr",
                newValue: updatedValueStr,
              });
            }}
          />
        </div>
      )}
    </>
  );
}

export default memo(ValueField);
