import { forwardRef, useImperativeHandle, useEffect, useState } from "react";
import { canvasSDKServices } from "../../../../services/canvasSDKServices";
// import { ODSLabel } from '@src/module/ods';
// import { FormulaBar } from "@src/module/ods";
import { ODSLabel, ODSFormulaBar as FormulaBar } from "@src/module/ods";
import cloneDeep from "lodash/cloneDeep";
import classes from "./index.module.css";

const Configure = forwardRef(({ variables, nodeData }, ref) => {
  const assetId = nodeData?.id;
  const [inputs, setInputs] = useState();
  const [outputs, setOutputs] = useState([]);
  const [workflow, setWorkflow] = useState();
  useImperativeHandle(
    ref,
    () => ({
      getData: () => {
        return {
          asset_id: assetId,
          inputs: inputs,
          outputs: outputs,
          published_id: workflow?._id,
          published_url: workflow?.deployment_info?.url,
        };
      },
    }),
    [outputs, inputs, workflow]
  );

  const processPublishedCanvasInputs = (data = [], savedData = []) => {
    const getUniqueKey = (item) => {
      let key = "root";
      if (item?.path?.length > 0) {
        key += `_${item.path.join("_")}`;
      }
      if (item?.key) {
        key += `_${item.key}`;
      }
      return key;
    };
    const flattenData = (data, flattenedObject) => {
      data.forEach((item) => {
        const key = getUniqueKey(item);
        if (item?.type?.toLowerCase() === "object") {
          if (item.isMap) {
            flattenedObject[key] = item?.value;
          } else if (item.isValueMode) {
            flattenedObject = flattenData(item?.value, flattenedObject);
          } else {
            flattenedObject = flattenData(item?.schema, flattenedObject);
          }
        } else if (item?.type?.toLowerCase() === "array") {
          if (item.isMap) {
            flattenedObject[key] = item?.value;
          } else if (item.isValueMode) {
            flattenedObject = flattenData(item?.value, flattenedObject);
          } else {
            flattenedObject = flattenData(item?.schema, flattenedObject);
          }
        } else {
          return (flattenedObject[key] = item?.value);
        }
      });
      return flattenedObject;
    };
    const flattenedSavedData = flattenData(savedData, {});

    const traverseData = (data) => {
      data.forEach((item) => {
        const key = getUniqueKey(item);
        if (item?.type?.toLowerCase() === "object") {
          if (flattenedSavedData[key]) {
            item.isMap = true;
            item.isValueMode = true;
            item.value = flattenedSavedData[key];
          } else {
            item.isValueMode = true;
            item.value = item.schema;
            // item.schema = undefined;
          }
          return traverseData(item?.schema);
        } else if (item?.type?.toLowerCase() === "array") {
          if (flattenedSavedData[key]) {
            item.isMap = true;
            item.isValueMode = true;
            item.value = flattenedSavedData[key];
          } else {
            item.isValueMode = true;
            item.value = undefined;
          }
          return traverseData(item?.schema);
        } else {
          item.isValueMode = true;
          item.value = flattenedSavedData[key] || item.default;
        }
      });
      return data;
    };
    const modifiedData = traverseData(data);
    setInputs(modifiedData);
  };

  useEffect(() => {
    const initialize = async () => {
      const selectedWorkflow = await canvasSDKServices.getPublishedByAsset({
        asset_id: assetId,
      });
      if (selectedWorkflow.status === "success") {
        setWorkflow(selectedWorkflow?.result);
        const response = await canvasSDKServices.getBoundsIOOfPublishedCanvas(
          selectedWorkflow?.result
        );

        processPublishedCanvasInputs(
          response.result.start,
          nodeData?.go_data?.inputs
        );
        setOutputs([
          ...(response?.result?.success || []),
          ...(response?.result?.failed || []),
        ]);
      }
    };
    initialize();
  }, []);

  const handleChange = (fieldIndex, newValue) => {
    setInputs((prev) => {
      const updated = [...prev];
      const updatedVal = {
        ...inputs[0],
        value: updated[0].value.map((field, idx) => {
          if (idx === fieldIndex) {
            return {
              ...field,
              value: newValue,
            };
          }
          return field;
        }),
      };
      return [updatedVal];
    });
  };

  return (
    <div className={classes["container"]}>
      {inputs?.[0]?.value?.map((item, index) => {
        return (
          <div className={classes["input-container"]}>
            <ODSLabel variant="body1">{keyToTitle(item?.key)}</ODSLabel>
            <div className={classes["input"]}>
              <FormulaBar
                variables={variables}
                defaultInputContent={cloneDeep(item?.value?.blocks)}
                onInputContentChanged={(content) => {
                  handleChange(index, {
                    type: "fx",
                    blocks: content,
                  });
                }}
                wrapContent={true}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default Configure;

function keyToTitle(key) {
  if (!key) return "";

  return key
    .replace(/_/g, " ") // Replace _ with space
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2") // Insert space before Capital letters (camelCase separation)
    .toLowerCase() // Convert everything to lowercase
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim() // Trim start/end spaces
    .replace(/^./, (str) => str.toUpperCase()); // Capitalize the first character
}
