import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import CREATE_SHEET_RECORD_NODE from "./constant";
import CreateRecord from "./CreateRecord";
// import { SHEET_ERRORS } from "../../../utils/errorEnums";
import cloneDeep from "lodash/cloneDeep";
import CommonDrawer from "../../common-components/CommonDrawer";
const CreateSheetRecordDialog = forwardRef(
  (
    {
      canvasRef,
      annotation,
      parentId,
      workspaceId,
      assetId,
      projectId,
      data = {},
      onSave = () => {},
      onDiscard = () => {},
      variables = {},
      nodeData,
      onAddNode = () => {},
      onUpdateTitle = () => {},
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const drawerRef = useRef();
    const currentSavedData = cloneDeep(data);

    // const validateData = useCallback((data) => {
    //   let errors = [];
    //   if (!data?.asset && !errors.includes(SHEET_ERRORS.SHEET_MISSING)) {
    //     errors.push(SHEET_ERRORS.SHEET_MISSING);
    //   }
    //   if (!data?.subSheet && !errors.includes(SHEET_ERRORS.TABLE_MISSING)) {
    //     errors.push(SHEET_ERRORS.TABLE_MISSING);
    //   }

    //   if (!data?.view && !errors.includes(SHEET_ERRORS.VIEW_MISSING)) {
    //     errors.push(SHEET_ERRORS.VIEW_MISSING);
    //   }

    //   data?.record?.map((r) => {
    //     if (
    //       r.required &&
    //       r.value?.blocks?.length === 0 &&
    //       !errors.includes(SHEET_ERRORS.MISSING_REQUIRED_FIELD)
    //     ) {
    //       errors.push(SHEET_ERRORS.MISSING_REQUIRED_FIELD);
    //     }
    //   });

    //   data.errors = errors;
    //   return data;
    // }, []);

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        const createRecord = ref.current?.getData();
        const error = ref.current?.getError();

        const messages = Object.values(error).reduce((acc, curr) => {
          if (curr.length > 0) {
            acc.push(...curr);
          }
          return acc;
        }, []);

        onSave(
          createRecord,
          {
            errors: messages,
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

    //     let currentSavedData = _.cloneDeep(data);
    //     delete currentSavedData?.errors;
    //     delete currentSavedData?.output;

    //     onDiscard(e, currentData, currentSavedData);
    //   },
    //   [data, onDiscard, ref]

    // );
    useEffect(() => {
      if (!data?.last_updated) {
        saveHandler();
      }
    }, [data?.last_updated, saveHandler]);

    return (
      // <ExtensionDialog
      //   dialogWidth="1200px"
      //   titleProps={titleProps}
      //   onDiscard={discardHandler}
      //   onSave={saveHandler}
      //   dialogContent={
      //     <CreateRecord
      //       ref={ref}
      //       data={currentSavedData}
      //       parentId={projectId}
      //       variables={variables}
      //     />
      //   }
      // />

      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || CREATE_SHEET_RECORD_NODE.name,
          icon: nodeData?._src || CREATE_SHEET_RECORD_NODE._src,
          foreground:
            nodeData?.foreground || CREATE_SHEET_RECORD_NODE.foreground,
          background:
            nodeData?.background || CREATE_SHEET_RECORD_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={CREATE_SHEET_RECORD_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <CreateRecord
          canvasRef={canvasRef}
          annotation={annotation}
          ref={ref}
          data={currentSavedData}
          parentId={parentId}
          variables={variables}
          workspaceId={workspaceId}
          assetId={assetId}
          projectId={projectId}
          onSave={saveHandler}
          nodeData={nodeData}
        />
      </CommonDrawer>
    );
  }
);
export default CreateSheetRecordDialog;
