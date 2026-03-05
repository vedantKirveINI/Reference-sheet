
import { useEffect, useState, memo } from "react";
import { isEmpty } from "lodash";

import useFieldsOperation from "../../../hook/useFieldsOperation";
import DefaultRow from "../../DefaultRow";
import TableHeader from "../../TableHeader";

import { getNestedStyles, getParentRowStyles, getContainerStyles,  } from "./styles";

import ValueCell from "../../Cell/ValueCell";
import MapSwitch from "../../../components/MapSwitch";
import CollapseIcon from "../../CollapseIcon";
import CheckboxCell from "../../Cell/CheckboxCell";
import { useInputGridContext } from "../../../context/InputGridContext";
// import WarningModal from "../../WarningModal";

/**
 * The `ObjectType` component is responsible for rendering and managing the state of an object type input grid.
 * It supports various functionalities such as collapsing, adding child components, handling checkbox changes,
 * and managing parent-child data relationships.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {number} props.index - The index of the current object type component.
 * @param {boolean} props.readOnly - Flag indicating if the component is in read-only mode.
 * @param {boolean} props.isValueMode - Flag indicating if the component is in value mode.
 * @param {Function} props.onChange - Callback function to handle changes in the component.
 * @param {boolean} [props.isLastRow=false] - Flag indicating if the component is the last row.
 * @param {string} [props.parentType=""] - The type of the parent component.
 * @param {boolean} [props.isKeyDisabled=false] - Flag indicating if the key input is disabled.
 * @param {Function} props.onDeleteHandler - Callback function to handle deletion of the component.
 * @param {boolean} props.showDelete - Flag indicating if the delete button should be shown.
 * @param {Object} props.initialValue - The initial value of the component.
 * @param {string} props.dataTestId - The data-testid attribute for testing purposes.
 * @param {boolean} props.enableCheckbox - Flag indicating if the checkbox is enabled.
 * @param {Function} props.onCheckboxChange - Callback function to handle checkbox changes.
 *
 * @returns {JSX.Element} The rendered `ObjectType` component.
 */
function ObjectType(props) {
  const {
    index,
    isValueMode,
    onChange,
    isLastRow = false,
    parentType = "",
    isKeyDisabled = false,
    onDeleteHandler: parentDeleteHandler,
    showDelete,
    initialValue,
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
  } = props;

  const { readOnly, allowMapping } = useInputGridContext();

  const [objValue, setObjValue] = useState([]);
  const [objComponent, setObjComponent] = useState([]);
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
    setComponent: setObjComponent,
    setData: setObjValue,
    parentOnChange,
    setParentData,
    isValueMode,
    setNewChildIndex,
    setWarningModal,
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

  // useEffect(() => {
  //   if (!isEmpty(objValue)) {
  //     console.log("running effect >>", objValue);
  //     const CONFIG_KEY = isValueMode ? "value" : "schema";

  //     parentOnChange({ key: CONFIG_KEY, value: objValue });
  //   }
  // }, [objValue]);

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
          isValueDisabled
          index={index}
          parentType={parentType}
          isValueMode={isValueMode}
          initialValue={initialValue}
          isKeyDisabled={isKeyDisabled}
          onChange={onChange}
          showDelete={showDelete}
          dataTestId={dataTestId}
          onDeleteHandler={parentDeleteHandler}
          hideColumnType={hideColumnType}
          variant={variant}
          hideBorder={hideBorder}
          onAddChildHandler={onAddChildHandler}
          showAdd={
            !showHeaders && !readOnly && !(parentData?.disableAdd ?? disableAdd)
          }
          chlidsCount={objValue?.length}
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
            {showHeaders && (
              <TableHeader
                dataType="Object"
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
            )}

            {objComponent?.map((compInfo, index) => {
              const { id, component: DataTypeComponent } = compInfo || {};
              return (
                <DataTypeComponent
                  key={id}
                  index={index}
                  parentType="Object"
                  isValueMode={isValueMode}
                  newChildIndex={newChildIndex}
                  initialValue={objValue[index]}
                  isFirstRow={index === 0}
                  isLastRow={index === objValue.length - 1}
                  showDelete={objValue.length > 1 && !readOnly}
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

export default memo(ObjectType);
