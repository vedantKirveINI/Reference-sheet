import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import CommonDrawer from "../../common-components/CommonDrawer";
import CompanyEnrichment from "./CompanyEnrichment";
import cloneDeep from "lodash/cloneDeep";
import COMPANY_ENRICHMENT_NODE from "./constant";

function CompanyEnrichmentDialog(props, ref) {
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
      const companyEnrichmentData = ref.current?.getData();
      const error = ref.current?.getError();

      const messages = Object.values(error).reduce((acc, curr) => {
        if (curr.length > 0) {
          acc.push(...curr);
        }
        return acc;
      }, []);

      onSave(
        companyEnrichmentData,
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
        name: nodeData?.name || COMPANY_ENRICHMENT_NODE.name,
        icon: nodeData?._src || COMPANY_ENRICHMENT_NODE._src,
        foreground: nodeData?.foreground || COMPANY_ENRICHMENT_NODE.foreground,
        background: nodeData?.background || COMPANY_ENRICHMENT_NODE.background,
        hoverDescription: nodeData?.hoverDescription,
      }}
      node={COMPANY_ENRICHMENT_NODE}
      onAddNode={onAddNode}
      onTitleChanged={onUpdateTitle}
      sidebarActions={sidebarActions}
      onSidebarActionClick={onSidebarActionClick}
      ref={drawerRef}
    >
      <CompanyEnrichment
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

export default forwardRef(CompanyEnrichmentDialog);
