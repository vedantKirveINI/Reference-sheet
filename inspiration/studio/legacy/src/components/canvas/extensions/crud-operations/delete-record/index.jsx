import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import AdvancedLabel from "oute-ds-advanced-label";
import Icon from "oute-ds-icon";
import { showConfirmDialog } from "oute-ds-dialog";
import DELETE_RECORD_NODE from "./constant";
import DeleteRecord from "./DeleteRecord";
// import ExtensionDialog from "../../common-components/ExtensionDialog";
import { DB_CONNECTION_ERRORS } from "../../../utils/errorEnums";
import CommonDrawer from "../../common-components/CommonDrawer";

const DeleteRecordDialog = forwardRef(
  (
    {
      // titleProps = {
      //   label: DELETE_RECORD_NODE.name,
      //   icon: DELETE_RECORD_NODE._src,
      //   foreground: DELETE_RECORD_NODE.foreground,
      //   background: DELETE_RECORD_NODE.background,
      // },
      data = {},
      projectId,
      onSave = () => {},
      onDiscard = () => {},
      variables = {},
      nodeData,
      parentId,
      canvasRef,
      annotation,
      workspaceId,
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
    //   data.errors = errors;
    //   return data;
    // }, []);

    const confirmDelete = useCallback(
      async (deleteRecord, openNodeAfterCreate) => {
        await showConfirmDialog({
          dialogTitle: (
            <AdvancedLabel
              fullWidth={true}
              labelText="Execute Dangerous Query"
              labelProps={{
                variant: "h6",
              }}
              leftAdornment={<Icon outeIconName="OUTEWarningIcon" />}
            />
          ),
          dialogContent: `You have not selected any filter on "${deleteRecord?.table?.name}".
           This will update all the records in "${deleteRecord?.table?.name}" table. 
           Are you sure you want to continue?`,
          onCancel: () =>
            onSave(
              deleteRecord,
              {
                errors: deleteRecord?.errors,
              },
              openNodeAfterCreate
            ),
          onOk: () => {
            ref.current.showFilterDialog();
          },
          okLabel: "UPDATE FILTER",
          cancelLabel: "DELETE ALL ROWS",
          dialogWidth: "600px",
          cancelButtonColor: "error",
        });
      },
      [onSave, ref]
    );

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let deleteRecord = ref.current?.getData();
        // deleteRecord = validateData(deleteRecord);
        if (!deleteRecord?.filter && deleteRecord?.table) {
          confirmDelete(deleteRecord, openNodeAfterCreate);
          return;
        }
        onSave(
          deleteRecord,
          {
            errors: deleteRecord?.errors,
          },
          openNodeAfterCreate
        );
      },
      [confirmDelete, onSave, ref]
    );

    // const discardHandler = useCallback(
    //   (e) => {
    //     let deleteRecord = ref.current?.getData();

    //     delete data?.errors;
    //     delete data?.output;
    //     onDiscard(e, deleteRecord, data);
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
          name: nodeData?.name || DELETE_RECORD_NODE.name,
          icon: nodeData?._src || DELETE_RECORD_NODE._src,
          foreground: nodeData?.foreground || DELETE_RECORD_NODE.foreground,
          background: nodeData?.background || DELETE_RECORD_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={DELETE_RECORD_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <DeleteRecord
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
export default DeleteRecordDialog;
