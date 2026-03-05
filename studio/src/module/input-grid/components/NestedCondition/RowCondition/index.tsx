import React from "react";
import { ODSIcon, ODSAutocomplete, FormulaBar, ODSTextField } from "@src/module/ods";
import { NON_PRIMITIVES, PRIMITIVES } from "../../../constants/type";
import { deleteChild, updateFieldValue, addChildHandler,  } from "../../../utils/fieldOperation";

import AddIcon from "../../AddButton";
import FormulaBarCell from "./FormulaBarCell";

import { getFlexBoxStyles, colStyles, getDisabledCol, valueCol, typeCol, keyCol, getAddIconStyles, getDeleteColStyles,  } from "./styles";

const TYPE_OPTIONS = [...NON_PRIMITIVES, ...PRIMITIVES].map(
  (ele) => ele[0].toUpperCase() + ele.slice(1)
);

const getValue = (type: string) => {
  if (!type) return "String";
  return type[0]?.toUpperCase() + type?.slice(1);
};

function RowCondition({
  data,
  onChange,
  currIndex,
  variables,
  rootValue,
  isLastChild,
  showAddIcon = false,
  isPrevNonPrimitive,
  hasOneElement = false,
  isParentMap = false,
}: any) {
  const { key = "", type = "", value = {} } = data || {};
  const isTypeNonPrimitive = NON_PRIMITIVES.includes(type.toLowerCase());

  const onFieldChangeHandler = ({
    fieldName,
    updatedValue,
    isAppendEmptyRow = true,
  }) => {
    updateFieldValue({ rootValue, updatedValue, fieldName, currIndex });

    if (isAppendEmptyRow) {
      addChildHandler({ currIndex, rootValue, isAddOnChange: true });
    }

    onChange({ updatedRootValue: rootValue });
  };

  if (isParentMap) {
    return (
      <FormulaBarCell
        currIndex={currIndex}
        variables={variables}
        data={data}
        isAppendEmptyRow={false}
        onFieldChangeHandler={onFieldChangeHandler}
      />
    );
  }

  return (
    <div
      style={getFlexBoxStyles({
        isPrevNonPrimitive,
        borderBottomCondition: isTypeNonPrimitive || !isLastChild,
      })}
      data-testid={`row_${currIndex}`}
    >
      <div style={getAddIconStyles({ showAddIcon })}>
        {showAddIcon ? (
          <AddIcon
            testId={currIndex}
            onClick={() => {
              addChildHandler({ currIndex, rootValue });
              onChange({ updatedRootValue: rootValue });
            }}
          />
        ) : null}
      </div>

      <div style={{...colStyles, ...keyCol}}>
        <ODSTextField
          testId={`key_${currIndex}`}
          placeholder="Key"
          value={key}
          style={{
            outline: "none",
            padding: 0,
            background: "inherit",
            border: "none",
            boxShadow: "none",
          }}
          inputStyles={{
            lineHeight: "unset",
            fontSize: "unset",
            background: "inherit !important",
          }}
          onChange={(e) => {
            onFieldChangeHandler({
              updatedValue: e.target.value,
              fieldName: "key",
            });
          }}
        />
      </div>

      <div style={typeCol}>
        <ODSAutocomplete
          data-testid={`type_${currIndex}`}
          size="small"
          className="min-w-[200px]"
          hideBorders
          value={getValue(type)}
          options={TYPE_OPTIONS}
          onChange={(e, updatedVal) => {
            onFieldChangeHandler({
              updatedValue: updatedVal.toLowerCase(),
              fieldName: "type",
            });
          }}
        />
      </div>

      <div style={{ ...colStyles, ...valueCol, ...getDisabledCol({ isTypeNonPrimitive }) }}>
        {!isTypeNonPrimitive && (
          <FormulaBarCell
            currIndex={currIndex}
            variables={variables}
            data={data}
            onFieldChangeHandler={onFieldChangeHandler}
          />
        )}
      </div>

      <div
        style={getDeleteColStyles({ hasOneElement })}
        role="presentation"
        onClick={() => {
          if (hasOneElement) return;

          const tempRootValue = rootValue;
          deleteChild({ tempRootValue, currIndex });

          onChange({ updatedRootValue: tempRootValue });
        }}
        data-testid={`delete_${currIndex}`}
      >
        <ODSIcon
          outeIconName="OUTETrashIcon"
          outeIconProps={{
            style: {
              width: "20px",
              height: "20px",
            },
          }}
        />
      </div>
    </div>
  );
}

export default RowCondition;
