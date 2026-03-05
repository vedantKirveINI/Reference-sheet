import { isEmpty, lowerCase, snakeCase, startCase, toUpper } from "lodash";
import StringType from "../common/DataType/StringType";
import { getDefaultData } from "../utils/getDefaultData";
import removeKeys from "../utils/removeKeys";
import { useCallback } from "react";
import { NON_PRIMITIVE, PRIMITIVE } from "../constant/datatype";
import { generateId } from "../utils/importJsonUtils";
import MAPPING from "../constant/defaultDataTypeMapping";
import questionDataTypeMapping, {
  questionDataType,
  SKIP_QUESTION_DATA_TYPES,
} from "../constant/questionDataTypeMapping";
import mapSchemaToConfig from "../utils/mapSchemaToConfig";

const checkIsMapValue = (config, configKey) => {
  return config.map((ele) => {
    const customConfig = ele?.[configKey];
    const type = startCase(lowerCase(ele.type));

    if (!ele.isMap && customConfig && Array.isArray(customConfig)) {
      const updatedConfig = checkIsMapValue(ele[configKey], configKey);

      return {
        ...ele,
        type,
        [configKey]: updatedConfig,
      };
    }

    if (ele?.isMap) {
      const { config = [], ...rest } = ele;

      if (PRIMITIVE.includes(lowerCase(type))) {
        return { ...ele, type };
      }

      const { value, valueStr } = config?.[0] || {};

      return {
        ...rest,
        type,
        value:
          value?.type === "fx"
            ? { ...value, blockStr: valueStr }
            : {
                type: "fx",
                blocks: [{ type: "PRIMITIVES", value }],
                blockStr: value,
              },
      };
    }

    return { ...ele, type };
  });
};

const updatedIsValueMode = ({ value = [], isValueMode }) => {
  const CONFIG_KEY = isValueMode ? "value" : "schema";
  const VALUE_KEY = isValueMode ? "value" : "default";

  return (value || []).map((rowData) => {
    const { type, isMap = false, [CONFIG_KEY]: configKey } = rowData;

    let tempRowData = rowData;
    const currValue = tempRowData?.[VALUE_KEY] || tempRowData?.default;

    if (!configKey && NON_PRIMITIVE.includes(lowerCase(type))) {
      tempRowData = {
        ...tempRowData,
        [CONFIG_KEY]: tempRowData?.schema || tempRowData?.config,
      };
    }

    if (
      (tempRowData?.[CONFIG_KEY] || tempRowData?.config) &&
      !isMap &&
      NON_PRIMITIVE.includes(lowerCase(type))
    ) {
      const updatedConfig = updatedIsValueMode({
        value: tempRowData?.[CONFIG_KEY] || tempRowData?.config,
        isValueMode,
      });

      if (tempRowData?.config) {
        tempRowData = removeKeys({
          obj: tempRowData,
          keysToRemove: ["config"],
        });
      }

      return {
        id: generateId(),
        ...tempRowData,
        isValueMode,
        [CONFIG_KEY]: updatedConfig,
      };
    }

    return {
      id: generateId(),
      ...tempRowData,
      // [VALUE_KEY]:
      //   currValue?.type === "fx"
      //     ? currValue
      //     : {
      //         type: "fx",
      //         blocks: [{ type: "PRIMITIVES", value: currValue }],
      //         blockStr: currValue,
      //       },
      [VALUE_KEY]: currValue,
      isValueMode,
    };
  });
};

const getQuestionDataTypeInfo = (alias) => {
  return questionDataTypeMapping?.[toUpper(snakeCase(alias))];
};

const updateQuestionTypeStructure = ({ isValueMode, alias, rowData }) => {
  const CONFIG_KEY = isValueMode ? "value" : "schema";

  const questionDataTypeInfo = getQuestionDataTypeInfo(alias) || {};

  const { schema = [], ...rest } = questionDataTypeInfo;

  const updatedConfig = mapSchemaToConfig({
    schema,
    isValueMode,
  });

  if (PRIMITIVE.includes(lowerCase(updatedConfig[0]?.type))) {
    updatedConfig[0].value = rowData?.[CONFIG_KEY];
  }

  return {
    isChecked: false,
    ...rowData,
    ...rest,
    [CONFIG_KEY]: updatedConfig,
  };
};

const updatedQuestionDataType = ({ value, isValueMode }) => {
  const CONFIG_KEY = isValueMode ? "value" : "schema";

  return value.reduce((acc, rowData) => {
    const { [CONFIG_KEY]: config, type, alias, isMap = false } = rowData;

    if (
      SKIP_QUESTION_DATA_TYPES.includes(lowerCase(alias)) ||
      SKIP_QUESTION_DATA_TYPES.includes(lowerCase(type))
    ) {
      return acc;
    }

    if (questionDataType.includes(lowerCase(type))) {
      const questionDataTypeInfo = questionDataTypeMapping[type] || {};

      const { schema, ...rest } = questionDataTypeInfo;

      if (schema && !isMap) {
        const updatedConfig = mapSchemaToConfig({
          schema,
          isValueMode,
        });

        acc.push({
          isChecked: false,
          ...rowData,
          ...rest,
          [CONFIG_KEY]: updatedConfig,
        });

        return acc;
      }

      acc.push({
        isChecked: false,
        ...rowData,
        ...rest,
      });

      return acc;
    }

    if (
      [
        "MCQ",
        "Drop Down Static",
        "Currency",
        "Phone Number",
        "Time",
        "Zip Code",
        "Ranking",
      ].includes(alias) &&
      type === "String"
    ) {
      acc.push(updateQuestionTypeStructure({ isValueMode, alias, rowData }));

      return acc;
    }

    if (config && NON_PRIMITIVE.includes(lowerCase(type)) && !isMap) {
      // added below logic to add displayKeyName for address type for previous created sheet node
      let processedConfig = config;
      if (alias === "Address") {
        const questionDataTypeInfo = getQuestionDataTypeInfo(alias) || {};

        const { schema = [] } = questionDataTypeInfo;

        processedConfig = processedConfig.map((item) => {
          const matchingSchemaItem = schema.find((ele) => ele.key === item.key);
          return {
            ...item,
            displayKeyName: matchingSchemaItem?.displayKeyName || item.key,
          };
        });
      }

      const updatedConfig = updatedQuestionDataType({
        value: processedConfig,
        isValueMode,
      });

      acc.push({
        isChecked: false,
        ...rowData,
        [CONFIG_KEY]: updatedConfig,
      });

      return acc;
    }

    acc.push({ isChecked: false, ...rowData });

    return acc;
  }, []);
};

function useInputGrid({
  setData,
  setGridData,
  isValueMode,
  onGridDataChange,
  setGridComponent,
  allowQuestionDataType = false,
}) {
  const CONFIG_KEY = isValueMode ? "value" : "schema";

  const onChangeHandler = (data) => {
    if (onGridDataChange) {
      onGridDataChange(data);
    }
  };

  const resetGrid = () => {
    setGridData([{ id: `${Date.now()}`, type: "String" }]);
    setGridComponent([{ id: `${Date.now()}`, component: StringType }]);
  };

  const onParentChangeHandler = ({ key, value }) => {
    setData((prev) => {
      const prevObj = prev?.[0];

      if (key === "isMap") {
        const updatedObj = removeKeys({
          obj: prevObj,
          keysToRemove: ["config", "value", "default", CONFIG_KEY],
        });

        const newData = [{ ...updatedObj, [key]: value, isChecked: value }];
        onChangeHandler(newData);

        return newData;
      }

      const newData = [{ ...prevObj, [key]: value }];
      onChangeHandler(newData);
      return newData;
    });

    if (key === "isMap") {
      resetGrid();
    }
  };

  const onCustomDataTypeChangeHandler = (val) => {
    const {
      type: actualType,
      schema = [],
      alias,
      ...rest
    } = getQuestionDataTypeInfo(val);

    const isNonPrimitive = NON_PRIMITIVE.includes(lowerCase(actualType));

    const newConfigData = (schema || []).map((item, index) => {
      return {
        id: `${Date.now()}_${index}`,
        ...item,
        type: startCase(item.type || "String"),
      };
    });

    setData((prev) => {
      const prevObj = prev[0];

      let updatedData = { ...prevObj, ...rest, type: actualType, alias };

      updatedData = removeKeys({
        obj: updatedData,
        keysToRemove: ["config", "value", "default", CONFIG_KEY, "key"],
      });

      if (isNonPrimitive) {
        updatedData[CONFIG_KEY] = newConfigData;
      }

      const newData = [updatedData];

      onChangeHandler(newData);

      return newData;
    });

    setGridData(() => {
      if (isNonPrimitive) {
        return newConfigData;
      }
      return [{ id: `${Date.now()}`, type: startCase(actualType) }];
    });

    setGridComponent(() => {
      if (isNonPrimitive) {
        return newConfigData.map((row) => {
          const { id, type } = row || {};
          const Component = MAPPING[lowerCase(type)];

          return { id, component: Component || StringType };
        });
      }

      return [
        {
          id: `${Date.now()}`,
          component: MAPPING[lowerCase(actualType)] || StringType,
        },
      ];
    });
  };

  const onDataTypeChangeHandler = (val, isCustomType = false) => {
    if (isCustomType) {
      onCustomDataTypeChangeHandler(val);
      return;
    }

    setData((prev) => {
      const prevObj = prev[0];

      const updatedData = removeKeys({
        obj: prevObj,
        keysToRemove: [
          "config",
          "value",
          "default",
          CONFIG_KEY,
          "alias",
          "disableAdd",
          "hideDelete",
        ],
      });

      const newData = [
        {
          id: prevObj.id,
          ...updatedData,
          type: val,
        },
      ];

      onChangeHandler(newData);

      return newData;
    });

    resetGrid();
  };

  const nestedOnChange = ({ key, value, shouldReturnNewRef = false }) => {
    setData((prev) => {
      const prevObj = prev?.[0] || {};
      prevObj[key] = value;

      onChangeHandler(prev);

      return shouldReturnNewRef ? [...prev] : prev;
    });
  };

  const validateIncomingValue = useCallback(({ incomingValue }) => {
    const firstObj = incomingValue?.[0] || {};

    return firstObj.hasOwnProperty("isValueMode");
  }, []);

  const modifyIncomingValue = useCallback(
    (value) => {
      const updatedIncomingValue = checkIsMapValue(value, CONFIG_KEY) || [];

      if (updatedIncomingValue.length === 1) {
        return updatedIncomingValue;
      }
      return [
        {
          id: `${Date.now()}`,
          type: "Object",
          isValueMode,
          [CONFIG_KEY]: updatedIncomingValue,
        },
      ];
    },
    [CONFIG_KEY, isValueMode]
  );

  const handleIncominglValue = useCallback(
    ({ incomingValue }) => {
      const DEFAULT_DATA = getDefaultData({ isValueMode });

      if (isEmpty(incomingValue)) {
        return DEFAULT_DATA;
      }

      const isIncomingValueValid = validateIncomingValue({ incomingValue });
      let updatedInitialValue = updatedIsValueMode({
        value: incomingValue,
        isValueMode,
      });

      if (allowQuestionDataType) {
        updatedInitialValue = updatedQuestionDataType({
          value: updatedInitialValue,
          isValueMode,
        });
      }

      if (isIncomingValueValid) {
        return updatedInitialValue;
      }

      return modifyIncomingValue(updatedInitialValue);
    },
    [isValueMode, modifyIncomingValue, validateIncomingValue]
  );

  return {
    onParentChangeHandler,
    onDataTypeChangeHandler,
    nestedOnChange,
    handleIncominglValue,
  };
}
export default useInputGrid;
