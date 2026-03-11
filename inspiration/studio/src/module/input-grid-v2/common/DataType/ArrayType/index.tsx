
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import useFieldsOperation from "../../../hook/useFieldsOperation";
import DefaultRow from "../../DefaultRow";

import { getNestedStyles, getParentRowStyles, getContainerStyles,  } from "./styles";

import TableHeader from "../../TableHeader";
import ValueCell from "../../Cell/ValueCell";
import MapSwitch from "../../../components/MapSwitch";
import CollapseIcon from "../../CollapseIcon";
import CheckboxCell from "../../Cell/CheckboxCell";
import { useInputGridContext } from "../../../context/InputGridContext";
// import WarningModal from "../../WarningModal";

/**
 * Component representing an array type input grid.
 *
 * @param {Object} props - The properties object.
 * @param {number} props.index - The index of the array item.
 * @param {Function} props.onChange - The function to call when the value changes.
 * @param {boolean} props.readOnly - Whether the input is read-only.
 * @param {boolean} props.showDelete - Whether to show the delete button.
 * @param {Object} props.initialValue - The initial value of the array item.
 * @param {boolean} [props.isLastRow=false] - Whether this is the last row in the array.
 * @param {boolean} [props.isValueMode=false] - Whether the component is in value mode.
 * @param {string} [props.parentType=""] - The type of the parent component.
 * @param {Function} props.onDeleteHandler - The function to call when the delete button is clicked.
 * @param {string} props.dataTestId - The data test ID for the component.
 * @param {boolean} props.enableCheckbox - Whether to enable the checkbox.
 * @param {Function} props.onCheckboxChange - The function to call when the checkbox value changes.
 *
 * @returns {JSX.Element} The rendered ArrayType component.
 */
function ArrayType({
  index,
  onChange,
  showDelete,
  initialValue,
  isLastRow = false,
  isValueMode = false,
  parentType = "",
  onDeleteHandler: parentDeleteHandler,
  dataTestId,
  hideColumnType = false,
  variant = "black",
  showHeaders = true,
  hideBorder = false,
  isFirstRow = false,
  isChild = true,
  enableCheckbox,
  onCheckboxChange: parentOnCheckboxChange,
  disableDelete = false,
  disableAdd = false,
  disableKeyEditing = false,
  disableTypeEditing = false,
  disableCheckboxSelection = false,
}) {
  const { readOnly, allowMapping } = useInputGridContext();

  const [arrVal, setArrVal] = useState([]);
  const [arrComponent, setArrComponent] = useState([]);
  const [parentData, setParentData] = useState(initialValue || {});
  const [isCollapse, setIsCollapse] = useState(false);
  const [warningModal, setWarningModal] = useState({ open: false });
  const [newChildIndex, setNewChildIndex] = useState();

  const parentOnChange = ({ key, value }) => {
    onChange({ key, value, index });
  };

  const {
    onDeleteHandler,
    onChangeHandler,
    onAddChildHandler,
    prefillData,
    onParentDataChangeHandler,
    // onAnyTypeHandler,
    updateChildCheckboxes,
    onChildCheckboxHandler,
  } = useFieldsOperation({
    setComponent: setArrComponent,
    setData: setArrVal,
    parentOnChange,
    setParentData,
    isValueMode,
    setWarningModal,
    setNewChildIndex,
    hideColumnType,
    parentOnCheckboxChange,
    parentIndex: index,
    enableCheckbox,
    parentData,
    disableCheckboxSelection:
      parentData?.disableCheckboxSelection ?? disableCheckboxSelection,
  });

  const handleParentDataChange = ({ key, value }) => {
    onParentDataChangeHandler({ key, value, alias: parentData?.alias });
  };

  useEffect(() => {
    if (!isEmpty(initialValue)) {
      prefillData(initialValue);
    }
  }, [initialValue, prefillData]);

  useEffect(() => {
    if (!isEmpty(initialValue)) {
      setParentData(initialValue);
    }
  }, [initialValue]);

  return (
    <div
      style={getContainerStyles({ isLastRow, isFirstRow, isChild, hideBorder })}
    >
      <div
        style={getParentRowStyles({
          isCollapse,
          enableCheckbox,
          isChecked: parentData?.isChecked,
          isLastRow,
        })}
        data-testid={dataTestId}
      >
        {enableCheckbox ? (
          <CheckboxCell
            checked={parentData?.isChecked}
            variant={variant}
            onChange={(isChecked) => {
              parentOnCheckboxChange({ isChecked, index });
              updateChildCheckboxes({ isChecked });
            }}
            disabled={disableCheckboxSelection}
            dataTestId={dataTestId}
          />
        ) : null}

        <CollapseIcon
          variant={variant}
          isCollapse={isCollapse}
          onClick={() => {
            setIsCollapse((prev) => !prev);
          }}
        />

        <DefaultRow
          index={index}
          isValueDisabled
          onChange={onChange}
          parentType={parentType}
          showDelete={showDelete}
          initialValue={initialValue}
          isValueMode={isValueMode}
          dataTestId={dataTestId}
          onDeleteHandler={parentDeleteHandler}
          hideColumnType={hideColumnType}
          variant={variant}
          hideBorder={hideBorder}
          onAddChildHandler={onAddChildHandler}
          showAdd={
            !showHeaders &&
            !readOnly &&
            isValueMode &&
            !(parentData?.disableAdd ?? disableAdd)
          }
          chlidsCount={arrVal?.length}
          showChildCount={true}
          disableDelete={disableDelete}
          disableKeyEditing={disableKeyEditing}
          disableTypeEditing={disableTypeEditing}
        />
      </div>

      <div style={getNestedStyles({ isLastRow, isCollapse, showHeaders })}>
        {!readOnly && (parentData?.allowMapping ?? allowMapping) ? (
          <MapSwitch
            value={parentData}
            onChange={handleParentDataChange}
            isValueMode={isValueMode}
            dataTestId={dataTestId}
            variant={variant}
          />
        ) : null}

        {!parentData.isMap ? (
          <>
            {isValueMode && showHeaders ? (
              <TableHeader
                dataType="Array"
                isValueMode={isValueMode}
                onAddChildHandler={onAddChildHandler}
                readOnly={readOnly}
                warningModal={warningModal}
                hideColumnType={hideColumnType}
                variant={variant}
                enableCheckbox={enableCheckbox}
                dataTestId={dataTestId}
                disableAdd={parentData?.disableAdd ?? disableAdd}
              />
            ) : null}

            {arrComponent.map((compInfo, index) => {
              const { id, component: DataTypeComponent } = compInfo;

              return (
                <DataTypeComponent
                  key={id}
                  index={index}
                  parentType="Array"
                  isValueMode={isValueMode}
                  newChildIndex={newChildIndex}
                  initialValue={arrVal[index]}
                  isKeyDisabled={!isValueMode}
                  showDelete={arrVal.length > 1 && !readOnly}
                  isFirstRow={index === 0}
                  isLastRow={index === arrVal.length - 1}
                  onChange={onChangeHandler}
                  onDeleteHandler={onDeleteHandler}
                  dataTestId={`${dataTestId}_${index}`}
                  hideColumnType={hideColumnType}
                  variant={variant}
                  showHeaders={showHeaders}
                  hideBorder={hideBorder}
                  onCheckboxChange={onChildCheckboxHandler}
                  enableCheckbox={enableCheckbox}
                  disableDelete={parentData?.disableDelete ?? disableDelete}
                  disableKeyEditing={
                    parentData?.disableKeyEditing ?? disableKeyEditing
                  }
                  disableTypeEditing={
                    parentData?.disableTypeEditing ?? disableTypeEditing
                  }
                  disableCheckboxSelection={
                    parentData?.disableCheckboxSelection ??
                    disableCheckboxSelection
                  }
                />
              );
            })}
          </>
        ) : (
          <ValueCell
            value={parentData}
            onChange={handleParentDataChange}
            isValueMode={isValueMode}
            hideBorders={false}
            readOnly={readOnly}
            dataTestId={dataTestId}
            variant={variant}
          />
        )}
      </div>

      {/* <WarningModal
        warningModal={warningModal}
        setWarningModal={setWarningModal}
        onConfirm={onAnyTypeHandler}
      /> */}
    </div>
  );
}

export default ArrayType;
