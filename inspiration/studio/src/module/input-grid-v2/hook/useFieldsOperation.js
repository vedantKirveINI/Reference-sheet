import MAPPING from "../constant/defaultDataTypeMapping";
import { NON_PRIMITIVE } from "../constant/datatype";
import { useCallback } from "react";
import StringType from "../common/DataType/StringType";
import removeKeys from "../utils/removeKeys";
import { lowerCase, startCase, toUpper, snakeCase, isEmpty } from "lodash";
import AnyType from "../common/DataType/AnyType";
import questionDataTypeMapping from "../constant/questionDataTypeMapping";
import mapSchemaToConfig from "../utils/mapSchemaToConfig";

const getQuestionDataTypeInfo = (alias) => {
  return questionDataTypeMapping?.[toUpper(snakeCase(alias))];
};

const updateNestedCheckboxes = ({ arr = [], isChecked, configKey }) => {
  return (arr || []).map((ele) => {
    const { type, isMap = false } = ele || {};

    const updatedItem = {
      ...ele,
      isChecked,
    };

    if (NON_PRIMITIVE.includes(lowerCase(type)) && !isMap) {
      const updatedConfig = updateNestedCheckboxes({
        arr: ele?.[configKey] || [],
        isChecked,
        configKey,
      });

      return {
        ...updatedItem,
        [configKey]: updatedConfig,
      };
    }

    return updatedItem;
  });
};

const processSchema = ({ schema, index = "root" }) => {
  return schema.map((item, idx) => {
    const updatedItem = {
      ...item,
      id: `${Date.now()}_${index}_${idx}`,
      isValueMode: true, // this function will be called only when isValueMode is true, thats why direct setting isValueMode to true
    };

    if (NON_PRIMITIVE.includes(lowerCase(item?.type)) && item?.schema) {
      // directly added updated schema in value key because this function will be triggered only when isValueMode is true
      updatedItem.value = processSchema({
        schema: item?.schema,
        index: `${index}_${idx}`,
      });
    }

    return updatedItem;
  });
};

const useFieldsOperation = ({
  setData,
  setComponent,
  parentOnChange,
  setParentData,
  isValueMode = false,
  setWarningModal,
  setNewChildIndex,
  hideColumnType = false,
  parentOnCheckboxChange,
  parentIndex = -1,
  enableCheckbox = false,
  disableCheckboxSelection = false,
  parentData = {},
}) => {
  const CONFIG_KEY = isValueMode ? "value" : "schema";

  const onDeleteHandler = useCallback(
    ({ index }) => {
      setComponent((prev) => {
        return prev.filter((comp, idx) => index !== idx);
      });

      setData((prev) => {
        const updated = prev.filter((val, idx) => index !== idx);

        parentOnChange({ key: [CONFIG_KEY], value: updated });

        return updated;
      });
    },
    [CONFIG_KEY, parentOnChange, setComponent, setData]
  );

  const onCustomChangeHandler = ({ value, index, key }) => {
    const {
      type: actualType,
      schema,
      alias,
      ...rest
    } = getQuestionDataTypeInfo(value);

    if (key === "type") {
      setComponent((prev) => {
        prev[index] = {
          ...prev[index],
          component: MAPPING[lowerCase(actualType)],
        };
        return [...prev];
      });
    }

    const newConfigData = mapSchemaToConfig({ schema, isValueMode });

    setData((prev) => {
      let prevData = prev[index];

      prevData = removeKeys({
        obj: prevData,
        keysToRemove: [
          "disableAdd",
          "disableDelete",
          "disableTypeEditing",
          "disableTypeEditing",
          "config",
          [CONFIG_KEY],
        ],
      });

      let updatedData = {
        ...prevData,
        ...rest,
        [key]: value,
        type: actualType,
        alias,
        isValueMode,
      };

      if (key === "type" && schema) {
        updatedData[CONFIG_KEY] = newConfigData;
      }

      prev[index] = updatedData;

      parentOnChange({ key: [CONFIG_KEY], value: prev });

      return prev;
    });
  };

  const onChangeHandler = useCallback(
    ({ value, index, key, isCustom = false }) => {
      //   if (key === "type" && value === "Any") {
      //     setWarningModal((prev) => ({ ...prev, open: true }));
      //     return;
      //   }
      if (isCustom) {
        onCustomChangeHandler({ value, index, key });
        return;
      }

      if (key === "type") {
        setComponent((prev) => {
          prev[index] = {
            ...prev[index],
            component: MAPPING[lowerCase(value)],
          };
          return [...prev];
        });
        // setWarningModal((prev) => ({ ...prev, showAdd: true }));
      }

      setData((prev) => {
        let updatedData = { ...prev[index], [key]: value };

        if (key === "type") {
          if (NON_PRIMITIVE.includes(lowerCase(value))) {
            const newConfigData = [
              {
                id: `${Date.now()}`,
                type: "String",
                isValueMode,
                isChecked: updatedData?.isChecked || false,
              },
            ];

            updatedData[CONFIG_KEY] = newConfigData;
          } else {
            updatedData = removeKeys({
              obj: updatedData,
              keysToRemove: ["config", [CONFIG_KEY]],
            });
          }

          updatedData = removeKeys({
            obj: updatedData,
            keysToRemove: [
              "alias",
              "disableAdd",
              "disableDelete",
              "disableTypeEditing",
              "disableTypeEditing",
              "icon",
            ],
          });
        }

        if (key === "isMap") {
          updatedData = removeKeys({
            obj: updatedData,
            keysToRemove: ["value", "default", "config", [CONFIG_KEY]],
          });
        }

        let shouldReturnNewRef = false;

        if (key === "value" && !updatedData?.isChecked) {
          shouldReturnNewRef =
            enableCheckbox &&
            (!updatedData.hasOwnProperty("isChecked") ||
              !updatedData?.isChecked);

          updatedData.isChecked = true;

          // let shouldSelectAll = true;

          // for (let item of prev) {
          //   if (
          //     !item.hasOwnProperty("allowCheckboxSelection") ||
          //     item?.allowCheckboxSelection
          //   ) {
          //     shouldSelectAll = false;
          //     break;
          //   }
          // }

          const shouldCheckAll = disableCheckboxSelection; // check all checkboxes if parent have disableCheckboxSelection as true

          if (shouldCheckAll) {
            prev.forEach((ele) => {
              ele.isChecked = true;
            });

            shouldReturnNewRef = false; // not to return new reference, parentOnCheckboxChange will render grid
            parentOnCheckboxChange({
              isChecked: true,
              index: parentIndex,
              shouldReturnNewRef: true, // this key is only for root level parent, to render grid
            });
          }
        }

        prev[index] = updatedData;

        parentOnChange({ key: [CONFIG_KEY], value: prev });

        return shouldReturnNewRef ? [...prev] : prev;
      });
    },
    [
      CONFIG_KEY,
      isValueMode,
      parentOnChange,
      setComponent,
      setData,
      setNewChildIndex,
    ]
  );

  const onAddChildHandler = ({ includePrev = true }) => {
    let newData = {
      id: `${Date.now()}`,
      type: hideColumnType ? "Any" : "String",
      isValueMode,
      isChecked: false,
    };

    const arrayCondition =
      isValueMode &&
      lowerCase(parentData?.type) === "array" &&
      parentData?.schema;

    if (arrayCondition) {
      const updatedData = processSchema({
        schema: parentData?.schema,
      });

      // picking only first item from schema of array
      newData = updatedData?.[0] || {};
    }

    if (parentData?.alias) {
      const { schema = [] } = getQuestionDataTypeInfo(parentData?.alias);

      if (!isEmpty(schema)) {
        const updatedConfig = mapSchemaToConfig({ schema, isValueMode });

        newData = updatedConfig?.[0] || {};
      }
    }

    const component = MAPPING[lowerCase(newData?.type)];

    setComponent((prev) => [
      ...(includePrev ? prev : []),
      {
        id: `${Date.now()}`,

        component:
          hideColumnType && !parentData?.alias && !arrayCondition
            ? AnyType
            : component,
      },
    ]);

    setData((prev) => {
      const updatedData = [...(includePrev ? prev : []), newData];

      parentOnChange({ key: [CONFIG_KEY], value: updatedData });
      setNewChildIndex(updatedData.length - 1);
      return updatedData;
    });

    if (enableCheckbox) {
      setTimeout(() => {
        parentOnCheckboxChange({
          isChecked: false,
          index: parentIndex,
          shouldReturnNewRef: true,
        });
      }, 0);
    }
  };

  const prefillData = useCallback(
    (data) => {
      const { [CONFIG_KEY]: customConfig, config, isMap = false } = data || {};

      if (isMap) return;

      setData(customConfig || config || []);

      setComponent(() => {
        return (customConfig || config || [])?.map((row) => {
          const { id, type } = row || {};
          const Component = MAPPING[lowerCase(type)];

          return { id, component: Component || StringType };
        });
      });
    },
    [CONFIG_KEY, setComponent, setData]
  );

  const onCustomParentisMapHandler = ({ alias }) => {
    const { schema } = getQuestionDataTypeInfo(alias);

    const newConfigData = mapSchemaToConfig({ schema, isValueMode });

    setParentData((prev) => {
      return {
        ...prev,
        [CONFIG_KEY]: newConfigData,
        isMap: false,
      };
    });

    setData(newConfigData);
    setComponent(() => {
      return newConfigData.map((row) => {
        const { id, type } = row || {};
        const Component = MAPPING[lowerCase(type)];

        return { id, component: Component || StringType };
      });
    });

    parentOnChange({ key: "isMap", value: false });
    parentOnChange({ key: [CONFIG_KEY], value: newConfigData });
  };

  const onParentDataChangeHandler = ({ key, value, alias = "" }) => {
    if (key === "isMap" && !value && alias) {
      onCustomParentisMapHandler({ alias });
      return;
    }

    setParentData((prev) => {
      if (key === "isMap") {
        const updatedObj = removeKeys({
          obj: prev,
          keysToRemove: ["value", "default", "config", [CONFIG_KEY]],
        });

        return { ...updatedObj, [key]: value };
      }
      return { ...prev, [key]: value };
    });

    if (key === "isMap" && value === false && parentData?.schema) {
      const updatedData = processSchema({
        schema: parentData?.schema,
      });

      setData(updatedData);
      setComponent(
        updatedData.map((row) => ({
          id: row.id,
          component: MAPPING[lowerCase(row.type)],
        }))
      );

      parentOnChange({ key: [CONFIG_KEY], value: updatedData });
      parentOnChange({ key: "isMap", value: false });
      return;
    }

    if (key === "isMap") {
      setData([
        {
          id: `${Date.now()}`,
          type: "String",
          isChecked: parentData?.isChecked,
        },
      ]);
      setComponent([{ id: `${Date.now()}`, component: StringType }]);
    }

    parentOnChange({ key, value });
  };

  const onAnyTypeHandler = () => {
    setData((prev) => {
      prev.splice(1, prev.length - 1);
      prev[0] = { id: `${Date.now()}`, type: "Any", isValueMode };

      parentOnChange({ key: [CONFIG_KEY], value: prev });

      return prev;
    });

    setComponent((prev) => {
      prev.splice(1, prev.length - 1);
      prev[0] = { id: `${Date.now()}`, component: MAPPING["any"] };

      return prev;
    });

    setWarningModal(() => ({ open: false, showAdd: false }));
  };

  const updateChildCheckboxes = ({ isChecked }) => {
    setData((prev) => {
      const updatedData = updateNestedCheckboxes({
        arr: prev,
        isChecked,
        configKey: CONFIG_KEY,
      });

      parentOnChange({ key: [CONFIG_KEY], value: updatedData });

      return updatedData;
    });
  };

  const onChildCheckboxHandler = ({ isChecked, index }) => {
    setData((prev) => {
      const updatedData = { ...prev[index], isChecked };

      prev[index] = updatedData;

      const checkboxValues = prev.map((item) => item?.isChecked || false);

      parentOnCheckboxChange({
        isChecked: !checkboxValues.includes(false),
        index: parentIndex,
      });

      parentOnChange({ key: [CONFIG_KEY], value: prev });

      return [...prev];
    });
  };

  return {
    onDeleteHandler,
    onChangeHandler,
    onAddChildHandler,
    prefillData,
    onParentDataChangeHandler,
    onAnyTypeHandler,
    updateChildCheckboxes,
    onChildCheckboxHandler,
  };
};

export default useFieldsOperation;
