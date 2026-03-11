import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import AdvancedLabel from "oute-ds-advanced-label";
import Icon from "oute-ds-icon";
import { showConfirmDialog } from "oute-ds-dialog";
import UPDATE_RECORD_NODE from "./constant";
import UpdateRecord from "./UpdateRecord";
// import ExtensionDialog from "../../common-components/ExtensionDialog";
import CommonDrawer from "../../common-components/CommonDrawer";
const UpdateRecordDialog = forwardRef(
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

    const confirmUpdation = useCallback(
      async (updateRecord) => {
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
          dialogContent: `You have not selected any filter on "${updateRecord?.table?.name}". This will update all the records in "${updateRecord?.table?.name}" table. Are you sure you want to continue?`,
          onCancel: () => {
            onSave(updateRecord, {
              errors: updateRecord?.errors,
            });
          },
          onOk: () => {
            ref.current.showFilterDialog();
          },
          okLabel: "Update Filter",
          cancelLabel: "Yes",
          dialogWidth: "600px",
        });
      },
      [onSave, ref]
    );

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let updateRecord = ref.current?.getData();
        // updateRecord = validateData(updateRecord);

        if (!updateRecord?.filter && updateRecord?.table) {
          confirmUpdation(updateRecord);
          return;
        }
        onSave(
          updateRecord,
          {
            errors: updateRecord?.errors,
          },
          openNodeAfterCreate
        );
      },
      [confirmUpdation, onSave, ref]
    );

    // const discardHandler = useCallback(
    //   (e) => {
    //     let updateRecord = ref.current?.getData();

    //     delete data?.errors;
    //     delete data?.output;
    //     onDiscard(e, updateRecord, data);
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
          name: nodeData?.name || UPDATE_RECORD_NODE.name,
          icon: nodeData?._src || UPDATE_RECORD_NODE._src,
          foreground: nodeData?.foreground || UPDATE_RECORD_NODE.foreground,
          background: nodeData?.background || UPDATE_RECORD_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={UPDATE_RECORD_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <UpdateRecord
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
export default UpdateRecordDialog;
