import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import FIND_ALL_RECORD_NODE from "./constant";
import FindAllRecord from "./FindAllRecord";
import ExtensionDialog from "../../common-components/ExtensionDialog";
import { DB_CONNECTION_ERRORS } from "../../../utils/errorEnums";
import CommonDrawer from "../../common-components/CommonDrawer";

const FindAllRecordDialog = forwardRef(
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
      parentId,
      assetId,
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
        let findAllRecord = ref.current?.getData();
        // findAllRecord = validateData(findAllRecord);
        onSave(
          findAllRecord,
          {
            errors: findAllRecord?.errors,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    // const discardHandler = useCallback(
    //   (e) => {
    //     let findAllRecord = ref.current?.getData();

    //     delete data?.errors;
    //     delete data?.output;
    //     onDiscard(e, findAllRecord, data);
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
          name: nodeData?.name || FIND_ALL_RECORD_NODE.name,
          icon: nodeData?._src || FIND_ALL_RECORD_NODE._src,
          foreground: nodeData?.foreground || FIND_ALL_RECORD_NODE.foreground,
          background: nodeData?.background || FIND_ALL_RECORD_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={FIND_ALL_RECORD_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <FindAllRecord
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
export default FindAllRecordDialog;
