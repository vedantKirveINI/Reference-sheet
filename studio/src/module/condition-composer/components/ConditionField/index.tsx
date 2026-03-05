import React from "react";
import { upperCase } from "lodash";
import { ODSAutocomplete } from "@src/module/ods";
import { changeConditionByAccessor } from "../../utils/fieldOperations";
import { ODSButton } from "@src/module/ods";

function ConditionField(props: any) {
  const {
    index,
    condition,
    collector,
    rootValues,
    onChangeHandler,
    dataTestId,
  } = props;

  const onConditionChangeHandler = ({ newValue }) => {
    const prevObj = { ...rootValues };

    changeConditionByAccessor({
      rootObj: prevObj,
      accessor: collector,
      updatedCondition: newValue,
    });

    onChangeHandler(prevObj);
  };

  if (index === 0) {
    return null;
  }

  return (
    <div
      className="min-w-20 w-full self-center flex justify-between items-center gap-2"
      data-testid={`${dataTestId}_field`}
    >
      <div className="flex-1 h-px border-t border-gray-300"></div>
      {index === 1 ? (
        <ODSAutocomplete
          variant="black"
          className="w-24 h-11"
          defaultValue={condition}
          getOptionLabel={(val) => upperCase(val)}
          onChange={(_, val) => {
            onConditionChangeHandler({ newValue: val });
          }}
          options={["and", "or"]}
          selectOnFocus={false}
          textFieldProps={{
            "data-testid": `${dataTestId}_operator`,
            inputProps: {
              cursor: "default !important",
            },
          }}
        />
      ) : null}

      {index > 1 ? (
        <ODSButton
          disabled
          label={upperCase(condition)}
          className="text-white bg-black font-inter text-sm font-semibold leading-9 tracking-wider"
        />
      ) : null}
      <div className="flex-1 h-px border-t border-gray-300"></div>
    </div>
  );
}

export default ConditionField;
