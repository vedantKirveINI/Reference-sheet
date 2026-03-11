import React, { forwardRef, useCallback, useEffect, useRef } from "react";

// import { RequestAuthType, RequestBodyType } from "../../classes";
// import { HTTP_ERRORS } from "../../utils/errorEnums";
// import ExtensionDialog from "../common-components/ExtensionDialog";
// import { HTTP_TYPE } from "../constants/types";

import HTTP_NODE from "./constant";
import Http from "./Http";
import _ from "lodash";
import CommonDrawer from "../common-components/CommonDrawer";
const HttpDialog = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data,
      variables = {},
      onSave = () => {},
      onDiscard = () => {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      nodeData,
      workspaceId,
      projectId,
      assetId,
      parentId,
      sidebarActions = [],
      onSidebarActionClick = () => {},
      isPremiumUser = false,
    },
    ref
  ) => {
    // _.cloneDeep(data) is done to take deep copy for deep object comparison
    const currentSavedData = _.cloneDeep(data);

    const drawerRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let httpData = ref.current?.getData();
        // httpData = validateData(httpData);
        onSave(
          httpData,
          {
            // name: httpData?.label || HTTP_TYPE,
            // description: httpData?.label || HTTP_TYPE,
            errors: httpData?.errors,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    // const discardHandler = useCallback(
    //   (e) => {
    //     let currentData = ref.current?.getData();
    //     currentData = _.cloneDeep(currentData);
    //     delete currentData.output.schema;

    //     let currentDataSaved = _.cloneDeep(data);
    //     delete currentDataSaved?.errors;
    //     delete currentDataSaved?.output?.schema;

    //     onDiscard(e, currentData, currentDataSaved);
    //   },
    //   [data, onDiscard, ref]
    // );
    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, ref, saveHandler]);

    return (
      <>
        {/* <ExtensionDialog
          dialogWidth="1400px"
          data-testid="http-dialog"
          titleProps={titleProps}
          onDiscard={discardHandler}
          onSave={saveHandler}
          PaperProps={{ "data-testid": "http-content" }}
          dialogContent={
            <Http ref={ref} data={currentSavedData} variables={variables} />
          }
        /> */}
        <CommonDrawer
          ref={drawerRef}
          onSave={saveHandler}
          onClose={(e) => {
            saveHandler(false);
            onDiscard(e);
          }}
          title={{
            name: nodeData?.name || HTTP_NODE.name,
            icon: nodeData?._src || HTTP_NODE._src,
            foreground: nodeData?.foreground || HTTP_NODE.foreground,
            background: nodeData?.background || HTTP_NODE.background,
            hoverDescription: nodeData?.hoverDescription,
            premium: !isPremiumUser && nodeData?.premium,
          }}
          node={HTTP_NODE}
          onAddNode={onAddNode}
          PaperProps={{ "data-testid": "http-content" }}
          onTitleChanged={onUpdateTitle}
          sidebarActions={sidebarActions}
          onSidebarActionClick={onSidebarActionClick}
        >
          <Http
            ref={ref}
            canvasRef={canvasRef}
            annotation={annotation}
            data={currentSavedData}
            variables={variables}
            onSave={saveHandler}
            nodeData={nodeData}
            workspaceId={workspaceId}
            assetId={assetId}
            projectId={projectId}
            parentId={parentId}
          />
        </CommonDrawer>
      </>
    );
  }
);
export default HttpDialog;
