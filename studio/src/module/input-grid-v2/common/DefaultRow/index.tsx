import { useState, memo, useEffect } from "react";
import { ODSIcon } from "@src/module/ods";
import TypeCell from "../Cell/TypeCell";
import KeyCell from "../Cell/KeyCell";
import ValueCell from "../Cell/ValueCell";
import isEqual from "lodash/isEqual";

import { getContainerStyles, cellStyles, divider, valueCell, disabledCell, getDeleteBtnStyles, chips, addWidth,  } from "./styles";
import AddButton from "../add-button";

import { useInputGridContext } from "../../context/InputGridContext";
interface ValueType {
  isValueMode: boolean;
  hideDelete?: boolean;
  [key: string]: any;
}

const defaultValue = {
  type: "String",
};

function DefaultRow({
  index,
  initialValue = {},
  isValueMode = false,
  isKeyDisabled = false,
  isValueDisabled = false,
  showDelete = false,
  onDeleteHandler,
  parentType = "",
  onChange,
  dataTestId,
  newChildIndex = -1,
  hideColumnType = false,
  variant = "black",
  hideBorder = false,
  onAddChildHandler = () => {},
  showAdd = false,
  chlidsCount = 0,
  showChildCount = false,
  disableDelete = false,
  disableKeyEditing = false,
  disableTypeEditing = false,
}) {
  const { readOnly, allowQuestionDataType } = useInputGridContext();

  const [value, setValue] = useState<ValueType>({
    ...(initialValue || defaultValue),
    isValueMode,
  });

  const onChangeHandler = ({ key, value: val, isCustom = false }) => {
    onChange({
      key,
      value: val,
      index,
      isCustom,
    });

    if (key !== "type") {
      setValue((prev) => ({
        ...prev,
        [key]: val,
      }));
    }
  };

  useEffect(() => {
    if (!isEqual(value, initialValue)) {
      setValue(() => ({
        ...initialValue,
        isValueMode,
      }));
    }
  }, [initialValue]);

  return (
    <div
      style={getContainerStyles({
        hideColumnType,
        showAdd,
        showChildCount,
        showDelete: showDelete && !disableDelete,
      })}
    >
      {!hideColumnType && (
        <div style={{...(!hideBorder ? divider : {}), ...cellStyles}}>
          <TypeCell
            value={value}
            onChange={onChangeHandler}
            readOnly={readOnly}
            dataTestId={dataTestId}
            variant={variant}
            allowQuestionDataType={allowQuestionDataType}
            disableTypeEditing={disableTypeEditing}
          />
        </div>
      )}

      <div
        style={{
          ...(!hideBorder ? divider : {}),
          ...cellStyles,
          ...(isKeyDisabled ? disabledCell : {}),
          ...(hideColumnType ? addWidth : {}),
        }}
      >
        <KeyCell
          value={value}
          index={index}
          isValueMode={isValueMode}
          parentType={parentType}
          isKeyDisabled={isKeyDisabled}
          onChange={onChangeHandler}
          dataTestId={dataTestId}
          hideColumnType={hideColumnType}
          variant={variant}
          newChildIndex={newChildIndex}
          readOnly={readOnly}
          disableKeyEditing={disableKeyEditing}
          allowQuestionDataType={allowQuestionDataType}
        />
      </div>

      <div style={{...valueCell, ...(isValueDisabled ? disabledCell : {})}}>
        <ValueCell
          value={value}
          isValueMode={isValueMode}
          isValueDisabled={isValueDisabled}
          onChange={onChangeHandler}
          readOnly={readOnly}
          dataTestId={dataTestId}
          variant={variant}
          hideBorder={hideBorder}
          index={index}
          newChildIndex={newChildIndex}
          parentType={parentType}
        />
      </div>

      {showChildCount && <span style={chips}>{chlidsCount} fields</span>}

      {showAdd && (
        <AddButton
          onClick={onAddChildHandler}
          variant={variant}
          isRowAddBtn={true}
        />
      )}

      {showDelete && !disableDelete ? (
        <div
          style={getDeleteBtnStyles({ hideBorder })}
          data-testid={`${dataTestId}_delete`}
        >
          <ODSIcon
            outeIconName="OUTETrashIcon"
            outeIconProps={{
              style: {
                width: "1.25rem",
                height: "1.25rem",
                color: variant === "black" ? "#212121" : "#0000008a",
              },
            }}
            onClick={() => {
              onDeleteHandler({ index });
            }}
            buttonProps={{
              style: {
                padding: "0rem 0.563rem",
              },
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

export default memo(DefaultRow);
