import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import FIND_ONE_RECORD_NODE from "./constant";
import FindOneRecord from "./FindOneRecord";
// import ExtensionDialog from "../../common-components/ExtensionDialog";
import { DB_CONNECTION_ERRORS } from "../../../utils/errorEnums";
import CommonDrawer from "../../common-components/CommonDrawer";
// import CREATE_RECORD_NODE from "../create-record/constant";
const FindOneRecordDialog = forwardRef(
  (
    {
      data = {},
      projectId,
      onSave = () => {},
      onDiscard = () => {},
      variables = {},
      nodeData,
      canvasRef,
      annotation,
      workspaceId,
      assetId,
      parentId,
      onAddNode = () => {},
      onUpdateTitle = () => {},
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const drawerRef = useRef();

    const currentSavedData = JSON.parse(JSON.stringify(data));

    // const validateData = useCallback((data) => {
    //   let errors = [];
    //   if (
    //     !data?.connection &&
    //     !errors.includes(DB_CONNECTION_ERRORS.CONNECTION_MISSING)
    //   ) {
    //     errors.push(DB_CONNECTION_ERRORS.CONNECTION_MISSING);
    //   }
    //   if (
    //     !data?.table &&
    //     !errors.includes(DB_CONNECTION_ERRORS.TABLE_MISSING)
    //   ) {
    //     errors.push(DB_CONNECTION_ERRORS.TABLE_MISSING);
    //   }
    //   data?.record?.every((r) => {
    //     if (
    //       !r.checked &&
    //       !errors.includes(DB_CONNECTION_ERRORS.SELECT_MIN_ONE_COLUMN)
    //     ) {
    //       errors.push(DB_CONNECTION_ERRORS.SELECT_MIN_ONE_COLUMN);
    //     }
    //   });
    //   data.errors = errors;
    //   return data;
    // }, []);

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let findOneRecord = ref.current?.getData();
        // findOneRecord = validateData(findOneRecord);
        onSave(
          findOneRecord,
          {
            errors: findOneRecord?.errors,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    // const discardHandler = useCallback(
    //   (e) => {
    //     let findOneRecord = ref.current?.getData();

    //     delete data?.errors;
    //     delete data?.output;
    //     onDiscard(e, findOneRecord, data);
    //   },
    //   [data, onDiscard, ref]
    // );
    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, saveHandler]);
    return (
      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || FIND_ONE_RECORD_NODE.name,
          icon: nodeData?._src || FIND_ONE_RECORD_NODE._src,
          foreground: nodeData?.foreground || FIND_ONE_RECORD_NODE.foreground,
          background: nodeData?.background || FIND_ONE_RECORD_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={FIND_ONE_RECORD_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <FindOneRecord
          ref={ref}
          data={currentSavedData}
          parentId={parentId}
          variables={variables}
          onSave={saveHandler}
          databaseType={
            nodeData?.databaseType || data?.connection?.databaseType
          }
          canvasRef={canvasRef}
          annotation={annotation}
          workspaceId={workspaceId}
          projectId={projectId}
          assetId={assetId}
          nodeData={nodeData}
        />
      </CommonDrawer>
    );
  }
);
export default FindOneRecordDialog;
