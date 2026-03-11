import { forwardRef, useImperativeHandle, useEffect, useState, useRef, useCallback,  } from "react";
import { canvasSDKServices } from "../../../../services/canvasSDKServices";
import classes from "./index.module.css";

// import { ODSAutocomplete as Autocomplete } from "@src/module/ods";
// import { ODSIcon as Icon } from "@src/module/ods";
import { ODSAutocomplete as Autocomplete, ODSIcon as Icon } from "@src/module/ods";
import { ODSInputGridV3 as InputGridV3 } from "@src/module/ods";
import WORKFLOW_SETUP_NODE from "../../constant";
const Configure = forwardRef(({ data = {}, projectId, variables }, ref) => {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [workflowInputs, setWorkflowInputs] = useState([]);
  const [workflowOutputs, setWorkflowOutputs] = useState([]);

  const inputGridRef = useRef();

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
            item.value = undefined;
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
    setWorkflowInputs(modifiedData);
  };

  const onWorkflowChanged = useCallback(
    async (e, workflow) => {
      if (workflow) {
        const response =
          await canvasSDKServices.getBoundsIOOfPublishedCanvas(workflow);
        processPublishedCanvasInputs(
          response.result?.start || [],
          data?.inputs
        );
        //   setWorkflowInputs(response?.result?.start || []);
        setWorkflowOutputs([
          ...(response?.result?.success || []),
          ...(response?.result?.failed || []),
        ]);
        setSelectedWorkflow(workflow);
      }
    },
    [data?.inputs]
  );

  useImperativeHandle(
    ref,
    () => ({
      getData: () => {
        return {
          asset_id: selectedWorkflow?.asset_id,
          published_id: selectedWorkflow?._id,
          published_url: selectedWorkflow?.deployment_info?.url,
          inputs: inputGridRef?.current?.getData(),
          outputs: workflowOutputs,
        };
      },
    }),
    [
      selectedWorkflow?._id,
      selectedWorkflow?.asset_id,
      selectedWorkflow?.deployment_info?.url,
      workflowOutputs,
    ]
  );

  useEffect(() => {
    const initialize = async () => {
      const getPublishedListByProjectResponse =
        await canvasSDKServices.getPublishedListByProject({
          project_id: projectId,
          annotation: "IC",
        });
      if (getPublishedListByProjectResponse.status === "success") {
        const workflows = getPublishedListByProjectResponse.result || [];
        setWorkflows(workflows);
        const selectedWorkflow = workflows?.find(
          (workflow) => workflow.asset_id === data?.asset_id
        );
        if (selectedWorkflow) {
          setSelectedWorkflow(selectedWorkflow);
          const response =
            await canvasSDKServices.getBoundsIOOfPublishedCanvas(
              selectedWorkflow
            );
          processPublishedCanvasInputs(response.result.start, data?.inputs);
          setWorkflowOutputs([
            ...(response?.result?.success || []),
            ...(response?.result?.failed || []),
          ]);
        }
      }
    };
    initialize();
  }, [data?.asset_id, data?.inputs, projectId]);

  return (
    <div className={classes["workflow-container"]}>
      <Autocomplete
        options={workflows}
        getOptionLabel={(option) => option?.name}
        isOptionEqualToValue={(option, value) => option._id === value._id}
        value={selectedWorkflow}
        onChange={onWorkflowChanged}
        disableClearable={false}
        style={{
          minWidth: "100%",
        }}
        renderOption={(props, option) => (
          <li {...props}>
            <div className="flex items-center h-10 gap-2">
              <Icon
                imageProps={{
                  src: WORKFLOW_SETUP_NODE._src,
                  width: 24,
                  height: 24,
                }}
              />
              {`${option.name}`}
            </div>
          </li>
        )}
        textFieldProps={{
          size: "small",
          placeholder: "Select a workflow",
          InputProps: {
            startAdornment: (
              <Icon
                imageProps={{
                  src: WORKFLOW_SETUP_NODE._src,
                  width: 32,
                  height: 32,
                }}
              />
            ),
          },
        }}
      />
      <InputGridV3
        key={selectedWorkflow?._id}
        ref={inputGridRef}
        isValueMode={true}
        initialValue={workflowInputs}
        replaceConfigKeyWith="schema"
        variables={variables}
      />
    </div>
  );
});

export default Configure;
