import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import CommonDrawer from "../../common-components/CommonDrawer";
import EmailEnrichment from "./EmailEnrichment";
import cloneDeep from "lodash/cloneDeep";
import EMAIL_ENRICHMENT_NODE from "./constant";

function EmailEnrichmentDialog(props, ref) {
  const {
    workspaceId,
    parentId,
    projectId,
    assetId,
    canvasRef,
    annotation,
    data = {},
    variables = {},
    onSave = () => {},
    onDiscard = () => {},
    nodeData = {},
    onAddNode = () => {},
    onUpdateTitle = () => {},
    sidebarActions = [],
    onSidebarActionClick = () => {},
  } = props;

  const currentSavedData = cloneDeep(data);
  const drawerRef = useRef();

  const saveHandler = useCallback(
    (openNodeAfterCreate = true) => {
      const emailEnrichmentData = ref.current?.getData();
      const error = ref.current?.getError();

      const messages = Object.values(error).reduce((acc, curr) => {
        if (curr.length > 0) {
          acc.push(...curr);
        }
        return acc;
      }, []);

      onSave(
        emailEnrichmentData,
        {
          errors: messages,
        },
        openNodeAfterCreate
      );
    },
    [onSave, ref]
  );

  useEffect(() => {
    if (!data?.last_updated) {
      saveHandler();
    }
  }, [data?.last_updated, saveHandler]);

  return (
    <CommonDrawer
      onSave={saveHandler}
      onClose={(e) => {
        saveHandler(false);
        onDiscard(e);
      }}
      title={{
        name: nodeData?.name || EMAIL_ENRICHMENT_NODE.name,
        icon: nodeData?._src || EMAIL_ENRICHMENT_NODE._src,
        foreground: nodeData?.foreground || EMAIL_ENRICHMENT_NODE.foreground,
        background: nodeData?.background || EMAIL_ENRICHMENT_NODE.background,
        hoverDescription: nodeData?.hoverDescription,
      }}
      node={EMAIL_ENRICHMENT_NODE}
      onAddNode={onAddNode}
      onTitleChanged={onUpdateTitle}
      sidebarActions={sidebarActions}
      onSidebarActionClick={onSidebarActionClick}
      ref={drawerRef}
    >
      <EmailEnrichment
        workspaceId={workspaceId}
        parentId={parentId}
        projectId={projectId}
        assetId={assetId}
        canvasRef={canvasRef}
        annotation={annotation}
        data={currentSavedData}
        onSave={saveHandler}
        nodeData={nodeData}
        variables={variables}
        ref={ref}
      />
    </CommonDrawer>
  );
}

export default forwardRef(EmailEnrichmentDialog);
