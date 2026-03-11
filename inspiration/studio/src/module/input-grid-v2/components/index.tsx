
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState,  } from "react";

import TableHeader from "../common/TableHeader";
import { NON_PRIMITIVE } from "../constant/datatype";
import getDataTypeComponent from "../utils/getDataTypeComponent";
import Description from "./Description";

import { isEmpty, lowerCase } from "lodash";
import StringType from "../common/DataType/StringType";
import useFieldsOperation from "../hook/useFieldsOperation";
import HeaderSelect from "./HeaderSelect";
import { getContainerStyles, parentData, getNestedContainerStyles, chips,  } from "./styles";
import useImportJson from "../hook/useImportJson";

import JsonModal from "./JsonModal";
import { convertJsonToGridSchema, convertDataToGridSchema, convertGridSchemaToJson,  } from "../utils/importJsonUtils";
import { getDefaultData, getDefaultRowData } from "../utils/getDefaultData";

import MapSwitch from "./MapSwitch";
import useInputGrid from "./useInputGrid";
import WarningModal from "../common/WarningModal";
import CollapseIcon from "../common/CollapseIcon";
import AddButton from "../common/add-button";
import { InputGridContext } from "../context/InputGridContext";
interface Value {
  type: string;
  blocks: any[];
  blockStr: string;
}

interface DataState {
  id: string;
  type: string;
  value?: Value;
  default?: Value;
  isMap?: boolean;
  config?: any[];
  isValueMode?: boolean;
  isChecked?: boolean;
}

function InputGridV2(props: any, ref) {
  const {
    initialValue = {},
    variables,
    readOnly = false,
    onGridDataChange,
    isValueMode = false,
    showNote = true,
    hideHeaderAndMap = false,
    hideColumnType = false,
    variant = "black",
    allowMapping = true,
    showHeaders = true,
    hideBorder = false,
    showFxCell = true,
    allowQuestionDataType = false,
    enableCheckbox = false,
    disableDelete = false,
    disableAdd = false,
    disableKeyEditing = false,
    disableTypeEditing = false,
    disableCheckboxSelection = false,
  } = props;

  const contextValue = {
    variables,
    readOnly,
    allowMapping,
    showFxCell,
    allowQuestionDataType,
  };

  const DEFAULT_DATA = getDefaultData({ isValueMode });
  const DEFAULT_ROW_DATA = getDefaultRowData({ isValueMode });

  const [data, setData] = useState<DataState[]>(DEFAULT_DATA);

  const [gridComponent, setGridComponent] = useState([
    { id: `${Date.now()}`, component: StringType },
  ]);

  const [gridData, setGridData] = useState([DEFAULT_ROW_DATA]);
  const [jsonModal, setJsonModal] = useState({ open: false });
  const [warningModal, setWarningModal] = useState({ open: false });
  const [newChildIndex, setNewChildIndex] = useState();
  const [isCollapse, setIsCollapse] = useState(false);

  const initialRef = useRef(false);

  const dataObj: DataState = data?.[0] || DEFAULT_ROW_DATA;
  const Component = getDataTypeComponent(dataObj.type);

  const {
    onParentChangeHandler,
    onDataTypeChangeHandler,
    nestedOnChange,
    handleIncominglValue,
  } = useInputGrid({
    setData,
    setGridComponent,
    setGridData,
    isValueMode,
    onGridDataChange,
    allowQuestionDataType,
  });

  const parentOnCheckboxChange = ({
    isChecked,
    shouldReturnNewRef = false,
  }) => {
    nestedOnChange({ key: "isChecked", value: isChecked, shouldReturnNewRef });
  };

  const { handleJsonData } = useImportJson({
    gridData,
    setGridData,
    data,
    setData,
    setGridComponent,
    jsonModal,
    setJsonModal,
    isValueMode,
  });

  const {
    onDeleteHandler,
    onChangeHandler,
    onAddChildHandler,
    prefillData,
    onAnyTypeHandler,
    updateChildCheckboxes,
    onChildCheckboxHandler,
  } = useFieldsOperation({
    setComponent: setGridComponent,
    setData: setGridData,
    parentOnChange: nestedOnChange,
    parentData: dataObj, //passing parentData to handle addition of data when root type is array in value mode
    setParentData: null,
    isValueMode,
    setWarningModal,
    setNewChildIndex,
    hideColumnType,
    parentOnCheckboxChange,
    enableCheckbox,
    disableCheckboxSelection,
  });

  const processIncomingData = useCallback(
    ({ incomingValue }) => {
      const updatedValue = handleIncominglValue({ incomingValue });
      setData(updatedValue);

      if (onGridDataChange) onGridDataChange(updatedValue);

      const firstData = updatedValue?.[0];

      if (firstData && NON_PRIMITIVE.includes(lowerCase(firstData.type))) {
        prefillData(updatedValue[0]);
      }
    },
    [handleIncominglValue, onGridDataChange, prefillData]
  );

  useEffect(() => {
    if (!initialRef.current && !isEmpty(initialValue)) {
      processIncomingData({ incomingValue: initialValue });

      initialRef.current = true;
    }
  }, [initialValue, processIncomingData]);

  useImperativeHandle(ref, () => {
    return {
      getValue: () => data,
      setJsonData: (json) => {
        handleJsonData(json);
      },
      updateGrid: (data) => {
        processIncomingData({ incomingValue: data });
      },
    };
  }, [data, handleJsonData, processIncomingData]);

  return (
    <InputGridContext.Provider value={contextValue}>
      <div data-testid="grid-container" style={getContainerStyles({ readOnly })}>
        {!isValueMode && showNote ? <Description /> : null}

        {!hideHeaderAndMap && (
          <HeaderSelect
            data={dataObj}
            allowQuestionDataType={allowQuestionDataType}
            onDataTypeChangeHandler={onDataTypeChangeHandler}
            readOnly={readOnly}
            variant={variant}
          />
        )}

        {NON_PRIMITIVE.includes(lowerCase(dataObj.type)) &&
        !readOnly &&
        !hideHeaderAndMap &&
        allowMapping ? (
          <MapSwitch
            value={data[0]}
            onChange={onParentChangeHandler}
            isValueMode={isValueMode}
            variant={variant}
          />
        ) : null}

        {!showHeaders && (
          <div style={parentData}>
            <div style={{ marginLeft: "-1.2rem" }}>
              <CollapseIcon
                variant={variant}
                isCollapse={isCollapse}
                onClick={() => {
                  setIsCollapse((prev) => !prev);
                }}
              />
              <span style={{ verticalAlign: "middle" }}>DATA</span>
            </div>

            <div>
              <span style={chips}>{gridData.length} fields</span>
              {!readOnly &&
                !disableAdd &&
                NON_PRIMITIVE.includes(lowerCase(dataObj.type)) && (
                  <AddButton onClick={onAddChildHandler} />
                )}
            </div>
          </div>
        )}

        {NON_PRIMITIVE.includes(lowerCase(dataObj.type)) && !dataObj.isMap ? (
          <div style={getNestedContainerStyles({ hideHeaderAndMap, isCollapse })}>
            {showHeaders && (
              <TableHeader
                dataType={dataObj.type}
                isValueMode={isValueMode}
                onAddChildHandler={onAddChildHandler}
                readOnly={readOnly}
                warningModal={warningModal}
                hideColumnType={hideColumnType}
                variant={variant}
                childsCount={gridData.length}
                isParentHeader={true}
                enableCheckbox={enableCheckbox}
                checked={dataObj?.isChecked}
                setChecked={parentOnCheckboxChange}
                onCheckboxChange={updateChildCheckboxes}
                disableAdd={disableAdd}
              />
            )}

            {gridComponent.map((compInfo, index) => {
              const { id, component: DataTypeComponent } = compInfo || {};

              return (
                <DataTypeComponent
                  key={id}
                  index={index}
                  isValueMode={isValueMode}
                  initialValue={gridData[index]}
                  newChildIndex={newChildIndex}
                  onChange={onChangeHandler}
                  parentType={dataObj.type}
                  showDelete={gridData.length > 1 && !readOnly}
                  onDeleteHandler={onDeleteHandler}
                  isFirstRow={index === 0}
                  isLastRow={index === gridData.length - 1}
                  isKeyDisabled={dataObj.type === "Array" && !isValueMode}
                  dataTestId={`row-${index}`}
                  hideColumnType={hideColumnType}
                  variant={variant}
                  showHeaders={showHeaders}
                  isChild={false}
                  hideBorder={hideBorder}
                  onCheckboxChange={onChildCheckboxHandler}
                  enableCheckbox={enableCheckbox}
                  disableDelete={disableDelete}
                  disableAdd={disableAdd}
                  disableKeyEditing={disableKeyEditing}
                  disableTypeEditing={disableTypeEditing}
                  disableCheckboxSelection={disableCheckboxSelection}
                />
              );
            })}
          </div>
        ) : (
          <Component
            value={dataObj}
            isValueMode={isValueMode}
            onChange={onParentChangeHandler}
          />
        )}

        <JsonModal jsonModal={jsonModal} setJsonModal={setJsonModal} />
        <WarningModal
          warningModal={warningModal}
          setWarningModal={setWarningModal}
          onConfirm={onAnyTypeHandler}
        />
      </div>
    </InputGridContext.Provider>
  );
}

export default forwardRef(InputGridV2);
export {
  convertJsonToGridSchema,
  convertDataToGridSchema,
  convertGridSchemaToJson,
};
