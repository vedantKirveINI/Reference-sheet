import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import CREATE_RECORD_NODE from "./constant";
import CreateRecord from "./CreateRecord";
// import ExtensionDialog from "../../common-components/ExtensionDialog";
// import { DB_CONNECTION_ERRORS } from "../../../utils/errorEnums";
import { CREATE_TYPE } from "../../constants/types";
import CommonDrawer from "../../common-components/CommonDrawer";

const CreateRecordDialog = forwardRef(
  (
    {
      data = {},
      parentId,
      onSave = () => {},
      onDiscard = () => {},
      variables = {},
      nodeData,
      canvasRef,
      annotation,
      workspaceId,
      projectId,
      assetId,
      onAddNode = () => {},
      onUpdateTitle = () => {},
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const drawerRef = useRef();

    // JSON.parse(JSON.stringify(data)) is done to take deep copy for deep object comparison
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
    //   data?.record?.map((r) => {
    //     if (
    //       r.required &&
    //       r.value?.blocks?.length === 0 &&
    //       !errors.includes(DB_CONNECTION_ERRORS.MISSING_REQUIRED_FIELD)
    //     ) {
    //       errors.push(DB_CONNECTION_ERRORS.MISSING_REQUIRED_FIELD);
    //     }
    //   });

    //   data.errors = errors;
    //   return data;
    // }, []);

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let createRecord = ref.current?.getData();
        // createRecord = validateData(createRecord);
        onSave(
          createRecord,
          {
            description: createRecord?.label || CREATE_TYPE,
            errors: createRecord?.errors,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    // const discardHandler = useCallback(
    //   (e) => {
    //     let createRecord = ref.current?.getData();

    //     delete data?.errors;
    //     delete data?.output;
    //     onDiscard(e, createRecord, data);
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
          name: nodeData?.name || CREATE_RECORD_NODE.name,
          icon: nodeData?._src || CREATE_RECORD_NODE._src,
          foreground: nodeData?.foreground || CREATE_RECORD_NODE.foreground,
          background: nodeData?.background || CREATE_RECORD_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={CREATE_RECORD_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <CreateRecord
          ref={ref}
          parentId={parentId}
          variables={variables}
          data={currentSavedData}
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
export default CreateRecordDialog;
