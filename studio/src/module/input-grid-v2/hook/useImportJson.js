import { isEmpty, lowerCase } from "lodash";

import {
  convertGridSchemaToJson,
  compareJSONWithTrackingAndTypeCheck,
  convertJsonToGridSchema,
  getType,
  arrayGridToJson,
  isGridEmpty,
} from "../utils/importJsonUtils";
import MAPPING from "../constant/defaultDataTypeMapping";
import StringType from "../common/DataType/StringType";
import { useCallback, useEffect } from "react";

function useImportJson({
  gridData,
  setGridData,
  data,
  setData,
  setGridComponent,
  jsonModal,
  setJsonModal,
  isValueMode,
}) {
  const updateGridData = useCallback(
    ({ jsonData, isOverride = false }) => {
      const CONFIG_KEY = isValueMode ? "value" : "schema";

      let updatedGridData = convertJsonToGridSchema(jsonData, isValueMode);

      setData((prev) => {
        const type = isOverride ? getType(jsonData) : prev[0].type;
        return [{ ...prev[0], type, [CONFIG_KEY]: updatedGridData }];
      });

      setGridData(() => updatedGridData);

      setGridComponent(() => {
        return updatedGridData.map((row) => {
          const { id, type } = row || {};
          const Component = MAPPING[lowerCase(type)];
          return { id, component: Component || StringType };
        });
      });
    },
    [isValueMode, setData, setGridComponent, setGridData]
  );

  const handleObjectJsonData = useCallback(
    async (json) => {
      const targetJSON = convertGridSchemaToJson(gridData, isValueMode);

      if (isEmpty(targetJSON)) {
        updateGridData({ jsonData: json, isOverride: true });
        return;
      }

      const compareJSONResult = compareJSONWithTrackingAndTypeCheck(
        targetJSON,
        json
      );

      const {
        mergedResult,
        changedTypeKeys = [],
        newKeys = [],
      } = compareJSONResult;

      if (!isEmpty(changedTypeKeys) || !isEmpty(newKeys)) {
        setJsonModal(() => ({
          open: true,
          payload: {
            compareJSONResult,
            inputJson: json,
          },
        }));

        return;
      }

      updateGridData({ jsonData: mergedResult });
    },
    [gridData, isValueMode, setJsonModal, updateGridData]
  );

  const handleArrayJsonData = useCallback(
    (json) => {
      if (isGridEmpty(gridData)) {
        updateGridData({ jsonData: json });
        return;
      }

      const gridJson = arrayGridToJson({ gridData, isValueMode });

      setJsonModal(() => ({
        open: true,
        payload: {
          compareJSONResult: {
            mergedResult: [...gridJson, ...json],
          },
          inputJson: json,
        },
      }));
    },
    [gridData, isValueMode, setJsonModal, updateGridData]
  );

  const handleJsonData = useCallback(
    (json) => {
      const jsonType = getType(json);
      const gridType = data[0]?.type;

      if (jsonType === gridType) {
        if (jsonType === "Array") {
          handleArrayJsonData(json);
        }

        if (jsonType === "Object") {
          handleObjectJsonData(json);
        }
        return;
      }

      setJsonModal(() => ({
        open: true,
        payload: {
          inputJson: json,
          isDifferentDatatype: true,
        },
      }));
    },
    [data, handleArrayJsonData, handleObjectJsonData, setJsonModal]
  );

  useEffect(() => {
    if (jsonModal?.status) {
      const { status, payload } = jsonModal || {};
      const { compareJSONResult, inputJson } = payload;

      if (status === "append") {
        updateGridData({ jsonData: compareJSONResult.mergedResult });
      } else if (status === "override") {
        updateGridData({ jsonData: inputJson, isOverride: true });
      }
    }
  }, [jsonModal, updateGridData]);

  return { handleJsonData };
}

export default useImportJson;
