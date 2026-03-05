import { useCallback, useState } from "react";
import { ODSButton } from "@src/module/ods";
import { toast } from "sonner";
import { HiddenParams } from "./components/hidden-params";
import { QueryParams } from "./components/query-params";
import ParamsInfo from "./components/params-info";
import classes from "./styles.module.css";

import {
  checkForDuplicates,
  paramsSanitizer,
  validateParams,
} from "./utils/helper";

const defaultParams = {
  HIDDEN_PARAMS: [],
  QUERY_PARAMS: [],
};

const ParamsComponent = ({
  onSave,
  initialData,
  assetId,
  parentId,
  workspaceId,
}) => {
  const [hiddenParams, setHiddenParams] = useState(
    initialData?.HIDDEN_PARAMS || defaultParams.HIDDEN_PARAMS
  );
  const [queryParams, setQueryParams] = useState(
    initialData?.QUERY_PARAMS || defaultParams.QUERY_PARAMS
  );
  const [isLoading, setIsLoading] = useState(false);

  const saveParamsData = useCallback(() => {
    const data = paramsSanitizer(hiddenParams, queryParams);

    if (!validateParams(hiddenParams)) {
      toast.error("Validation Error", {
        description:
          "Each Hidden Parameter must include a Name and Value. Some fields are missing.",
      });
      return;
    }

    if (!checkForDuplicates(hiddenParams)) {
      toast.error("Validation Error", {
        description:
          "Hidden parameter Names must be unique. Please fix duplicates.",
      });
      return;
    }
    if (!checkForDuplicates(queryParams)) {
      toast.error("Validation Error", {
        description: "Query parameter Names must be unique. Please fix duplicates.",
      });
      return;
    }

    try {
      setIsLoading(true);
      onSave(data);
      toast.success("Data saved successfully");
    } catch (saveError) {
      toast.error("Save Error", {
        description: "Some error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  }, [hiddenParams, queryParams, onSave]);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "grid",
        gridTemplateRows: "1fr auto",
        padding: "0.5rem",
      }}
      data-testid="params-container"
    >
      <div
        className={classes["paramsDialogContent"]}
        data-testid="params-dialog-content"
      >
        <div
          className={classes["paramsSection"]}
          data-testid="hidden-params-container"
        >
          <ParamsInfo
            title="Hidden Params"
            description="Hidden parameters are utilized to store essential constant or sensitive information that is directly related to specific nodes."
          />
          <HiddenParams
            assetId={assetId}
            inputs={hiddenParams}
            parentId={parentId}
            setHiddenParams={setHiddenParams}
            workspaceId={workspaceId}
          />
        </div>

        <div
          className={classes["paramsSection"]}
          data-testid="query-params-container"
        >
          <ParamsInfo
            title="Query Params"
            description="URL parameters (also known as “query strings”) are a way to structure additional information for a given URL."
          />
          <QueryParams
            assetId={assetId}
            inputs={queryParams}
            parentId={parentId}
            setQueryParams={setQueryParams}
            workspaceId={workspaceId}
          />
        </div>
      </div>
      <div className={classes["footer"]} data-testid="params-footer">
        <ODSButton
          disable={isLoading}
          label="SAVE"
          size="large"
          variant="black"
          onClick={saveParamsData}
          data-testid="params-save-button"
        />
      </div>
    </div>
  );
};
export default ParamsComponent;
