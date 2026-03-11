
import { memo } from "react";
import DefaultRow from "../../DefaultRow";
import { getParentRow, emptySpace } from "../primitivesStyles";
import CheckboxCell from "../../Cell/CheckboxCell";
function IntType(props) {
  const {
    initialValue,
    isLastRow,
    index,
    parentType,
    isValueMode,
    dataTestId,
    showHeaders = true,
    hideBorder = false,
    isChild = true,
    hideColumnType,
    enableCheckbox,
    onCheckboxChange,
    variant = "black",
    disableCheckboxSelection = false,
  } = props;

  return (
    <div
      style={getParentRow({
        isLastRow,
        index,
        parentType,
        isValueMode,
        showHeaders,
        hideBorder,
        isChild,
        hideColumnType,
        enableCheckbox,
        isChecked: initialValue?.isChecked,
      })}
      data-testid={dataTestId}
    >
      {enableCheckbox ? (
        <CheckboxCell
          checked={initialValue?.isChecked}
          onChange={(val) => {
            onCheckboxChange({ isChecked: val, index });
          }}
          disabled={disableCheckboxSelection}
          variant={variant}
          dataTestId={dataTestId}
        />
      ) : null}
      <div style={emptySpace}></div>
      <DefaultRow {...props} initialValue={{ ...initialValue, type: "Int" }} />
    </div>
  );
}

export default memo(IntType);
