import _ from "lodash";
import OuteServicesFlowUtility from "oute-services-flow-utility-sdk";
import { TableType } from "../constants/table-type";



const updateRowValue = ({ defaultValue = [], rowData = [] }) => {
  const updatedValue = [];
  const defaultValueMap = {};
  defaultValue.forEach(item => {
    if (item && item.key !== undefined) {
      defaultValueMap[item.key] = item.value;
    }
  });

  rowData.forEach((item, index) => {
    const key = item?.key;
    if (defaultValueMap.hasOwnProperty(key)) {
      updatedValue.push({ key: key, value: defaultValueMap[key] });
    } else {
      updatedValue.push({ key: key, value: undefined });
    }
  });

  return updatedValue;
};

export const getRowData = ({
  settings,
  answers,
  isCreator,
  defaultValue,
  creatorValue,
}: any) => {

  const getDefaultValue = () => {
    const fillerValue = defaultValue;
    const rowData = fillerValue?.length > 0 ? fillerValue : creatorValue;
    if (settings?.withDefaultValue) {
      return rowData?.map((row) => ({
        ...row,
        default: row?.default,
      }));
    }
    return rowData;
  };

  if (isCreator || settings?.tableType === TableType.STATIC) {
    return getDefaultValue();
  }

  const keyAccessor = "key";
  const valueAccessor = "value";

  const res = OuteServicesFlowUtility?.resolveValue(
    answers,
    "",
    settings?.variables,
    null
  );

  const dynamicInputs = Array.isArray(res?.value) ? res?.value : [];



  if (typeof dynamicInputs[0] === "string") {
    const dynamicRowData = dynamicInputs.map((input) => ({
      key: input,
      value: undefined,
    }));

    return updateRowValue({
      defaultValue: defaultValue,
      rowData: dynamicRowData,
    });
  }

  
  if (!dynamicInputs[0] || _.isEmpty(dynamicInputs[0][keyAccessor])) return [];

  const dynamicRowData = dynamicInputs.map((data: any) => {
    //@TODO - need to discuss on value as a string is not being rendered in grid with Sattu and Alston
    return {
      key: data[keyAccessor],
      value: data[valueAccessor],
    };
  });


  if (defaultValue?.length > 0) {
    return updateRowValue({
      defaultValue: defaultValue,
      rowData: dynamicRowData,
    });
  }


  return dynamicRowData;
};
