import { isEmpty } from "lodash";
import { NON_PRIMITIVES, DEFAULT_TYPE } from "../constants/type";

export const getCurrIndex = ({ prevIndex, index }) => {
  if (!prevIndex) return `${index}`;
  return `${prevIndex}_${index}`;
};

export const deleteChild = ({ tempRootValue, currIndex }) => {
  const splitedIndex = currIndex?.split("_");
  const lastIndex = splitedIndex.slice(-1)[0];

  let tempVal = tempRootValue;

  for (let i = 0; i < splitedIndex.length - 1; i += 1) {
    const index = splitedIndex[i];
    tempVal = tempVal[index]?.config;
  }

  tempVal.splice(lastIndex, 1);
};

const isLastFieldEmpty = ({ arr }) => {
  const lastEle = (arr || []).slice(-1)[0];

  const { key = "", value = {} } = lastEle || {};
  return isEmpty(key) && isEmpty(value.blocks);
};

export const addChildHandler = ({
  currIndex,
  rootValue,
  isAddOnChange = false,
}) => {
  const childObj = {
    id: `${Date.now()}`,
    type: DEFAULT_TYPE,
  };

  let tempVal = rootValue;
  const splitedIndex = currIndex?.split("_");
  const splitedLength = splitedIndex.length;

  const loopCondition = isAddOnChange ? splitedLength - 1 : splitedLength;

  for (let i = 0; i < loopCondition; i += 1) {
    const index = splitedIndex[i];
    tempVal = tempVal[index]?.config;
  }

  if (isAddOnChange) {
    const isEmptyFieldPresent = isLastFieldEmpty({ arr: tempVal });

    if (isEmptyFieldPresent) return;
  }

  tempVal.push(childObj);
};

export const updateFieldValue = ({
  rootValue,
  updatedValue,
  currIndex,
  fieldName,
}) => {
  let tempVal = rootValue;
  const splitedIndex = currIndex?.split("_");

  splitedIndex.forEach((ele, i) => {
    if (i === 0) {
      tempVal = tempVal[ele];
      return;
    }
    tempVal = tempVal.config[ele];
  });

  if (fieldName === "value") {
    const { fxUpdatedVal, fxUpdatedValStr } = updatedValue || {};

    tempVal[fieldName] = {
      type: "fx",
      blocks: fxUpdatedVal,
    };

    tempVal.valueStr = fxUpdatedValStr;

    return;
  }

  if (fieldName === "type") {
    if (NON_PRIMITIVES.includes(updatedValue)) {
      tempVal.config = [{ id: `${Date.now()}`, type: DEFAULT_TYPE }];
      tempVal.isMap = false;
      tempVal.value = undefined;
    } else {
      tempVal.config = undefined;
    }
  }

  if (fieldName === "isMap") {
    tempVal.config = [
      {
        id: `${Date.now()}`,
        type: updatedValue ? tempVal?.type : DEFAULT_TYPE,
      },
    ];
  }

  tempVal[fieldName] = updatedValue;
};

export const addEmptyField = ({ initialValue = [] }) => {
  const isEmptyFieldPresent = isLastFieldEmpty({ arr: initialValue });

  if (!isEmptyFieldPresent) {
    initialValue.push({ id: `${Date.now()}`, type: DEFAULT_TYPE });
  }

  initialValue.forEach((val) => {
    const { config = [], type, isMap = false } = val || {};

    if (isEmpty(config)) {
      config.push({ id: `${Date.now()}`, type: isMap ? type : DEFAULT_TYPE });
    } else if (!isMap && !isEmpty(config)) {
      addEmptyField({ initialValue: val?.config });
    }
  });
};

export const filterOutput = ({ value }) => {
  const outputValue = JSON.parse(JSON.stringify(value));
  const newArr = [];

  for (let i = 0; i < outputValue.length; i++) {
    const currObj = outputValue[i];

    if (currObj?.config) {
      const updatedConfig = filterOutput({ value: currObj.config });
      currObj.config = updatedConfig;
      newArr.push(currObj);
      continue;
    }

    const isObjEmpty = isLastFieldEmpty({ arr: [currObj] });

    if (!isObjEmpty) {
      newArr.push(currObj);
    }
  }

  return newArr;
};
