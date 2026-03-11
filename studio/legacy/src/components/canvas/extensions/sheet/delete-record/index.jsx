import React, { forwardRef, useCallback, useEffect, useRef } from "react";
// import { showConfirmDialog } from "oute-ds-dialog";
// import AdvancedLabel from "oute-ds-advanced-label";
// import Icon from "oute-ds-icon";

import DELETE_SHEET_RECORD_NODE from "./constant";
import DeleteRecord from "./DeleteRecord";
// import ExtensionDialog from "../../common-components/ExtensionDialog";
// import { SHEET_ERRORS } from "../../../utils/errorEnums";
import cloneDeep from "lodash/cloneDeep";
import CommonDrawer from "../../common-components/CommonDrawer";
// import { SHEET_ERRORS } from "../../../utils/errorEnums";
const DeleteSheetRecordDialog = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      parentId,
      workspaceId,
      assetId,
      projectId,
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
    const currentSavedData = cloneDeep(data);

    const drawerRef = useRef();

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

    //   data.errors = errors;
    //   return data;
    // }, []);

    // const confirmUpdation = useCallback(
    //   async (deleteRecord) => {
    //     await showConfirmDialog({
    //       dialogTitle: (
    //         <AdvancedLabel
    //           fullWidth={true}
    //           labelText="Execute Dangerous Query"
    //           labelProps={{
    //             variant: "h6",
    //           }}
    //           leftAdornment={<Icon outeIconName="OUTEWarningIcon" />}
    //         />
    //       ),
    //       dialogContent: `You have not selected any filter on "${deleteRecord?.asset?.name}". This will update all the records in "${deleteRecord?.asset?.name}" table. Are you sure you want to continue?`,
    //       onCancel: () => {
    //         onSave(deleteRecord, {
    //           // name: deleteRecord?.label || DELETE_SHEET_RECORD_NODE.name,
    //           errors: deleteRecord?.errors,
    //         });
    //       },
    //       okLabel: "Update Filter",
    //       cancelLabel: "Yes",
    //       dialogWidth: "600px",
    //     });
    //   },
    //   [onSave]
    // );

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        const deleteRecord = ref.current?.getData();
        const error = ref.current?.getError();

        const messages = Object.values(error).reduce((acc, curr) => {
          if (curr.length > 0) {
            acc.push(...curr);
          }
          return acc;
        }, []);

        // deleteRecord = validateData(deleteRecord);

        // if (!deleteRecord?.filter && deleteRecord?.view) {
        //   confirmUpdation(deleteRecord);
        //   return;
        // }
        onSave(
          deleteRecord,
          {
            // name: deleteRecord?.label || DELETE_SHEET_RECORD_NODE.name,
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
      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || DELETE_SHEET_RECORD_NODE.name,
          icon: nodeData?._src || DELETE_SHEET_RECORD_NODE._src,
          foreground:
            nodeData?.foreground || DELETE_SHEET_RECORD_NODE.foreground,
          background:
            nodeData?.background || DELETE_SHEET_RECORD_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={DELETE_SHEET_RECORD_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <DeleteRecord
          ref={ref}
          canvasRef={canvasRef}
          annotation={annotation}
          parentId={parentId}
          workspaceId={workspaceId}
          assetId={assetId}
          projectId={projectId}
          variables={variables}
          data={currentSavedData}
          onSave={saveHandler}
          nodeData={nodeData}
        />
      </CommonDrawer>
    );
  }
);
export default DeleteSheetRecordDialog;
