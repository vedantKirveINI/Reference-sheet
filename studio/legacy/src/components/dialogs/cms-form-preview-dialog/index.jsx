import React, { useState, useRef, useEffect, useMemo } from "react";
import { BaseFormNode, INTEGRATION_NODE_MODES } from "../../canvas/extensions";
import canvasServices from "../../../sdk-services/canvas-sdk-services";
import { SUCCESS } from "../../../constants/keys";
// import ODSCircularProgress from "oute-ds-circular-progress";
import { ODSCircularProgress } from "@src/module/ods";
import assetSDKServices from "../../../sdk-services/asset-sdk-services";

const CMSFormPreviewDialog = ({
  payload,
  onClose = () => {},
  variables = {},
}) => {
  const [canvasResult, setCanvasResult] = useState({});
  const [assetMeta, setAssetMeta] = useState([]);
  const formNodeRef = useRef(null);
  const [resourceIds, setResourceIds] = useState({
    parentId: payload?.parent_id,
    projectId: payload?.project_id,
    workspaceId: payload?.workspace_id,
    assetId: payload?.asset_id,
    _id: "",
    canvasId: "",
  });

  const projectVariables = useMemo(() => {
    return {
      LOCAL: variables?.LOCAL || [],
      GLOBAL: variables?.GLOBAL || [],
    };
  }, [variables]);

  useEffect(() => {
    if (payload?.project_id && payload) {
      Promise.all([
        assetSDKServices.findOne({ _id: payload.project_id }),
        canvasServices.canvasToPublished(payload),
      ])
        .then(([assetRes, canvasRes]) => {
          if (assetRes.status === SUCCESS) {
            setAssetMeta(assetRes?.result?.meta);
          }
          if (canvasRes.status === SUCCESS) {
            setCanvasResult(canvasRes?.result);
            setResourceIds((prevIds) => {
              return {
                ...prevIds,
                canvasId: canvasRes?.result?.canvas_id,
              };
            });
          }
        })
        .catch(() => {
          onClose();
        });
    }
  }, [payload?.project_id, payload, onClose]);

  return (
    <>
      {!canvasResult?.flow && (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ODSCircularProgress />
        </div>
      )}
      {canvasResult?.flow && (
        <BaseFormNode
          ref={formNodeRef}
          nodeData={{
            flow: canvasResult?.flow,
            taskGraph: canvasResult?.task_graph,
            annotation: canvasResult?.annotation,
            projectVariables: projectVariables,
            resourceIds,
            result: canvasResult,
            _src: assetMeta?.thumbnail,
            type: "Integration",
          }}
          parentId={resourceIds?.parentId}
          projectId={resourceIds?.projectId}
          workspaceId={resourceIds?.workspaceId}
          assetId={resourceIds?.assetId}
          variables={variables}
          mode={INTEGRATION_NODE_MODES.PREVIEW}
        />
      )}
    </>
  );
};

export default CMSFormPreviewDialog;
