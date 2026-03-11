import React, { forwardRef, useCallback, useEffect, useRef } from "react";
// import AdvancedLabel from "oute-ds-advanced-label";
// import Icon from "oute-ds-icon";
// import { showConfirmDialog } from "oute-ds-dialog";
import UPDATE_SHEET_RECORD_NODE from "./constant";
import UpdateRecord from "./UpdateRecord";
import { SHEET_ERRORS } from "../../../utils/errorEnums";
import _ from "lodash";
import CommonDrawer from "../../common-components/CommonDrawer";
const UpdateSheetRecordDialog = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      projectId,
      workspaceId,
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
    const currentSavedData = _.cloneDeep(data);

    const drawerRef = useRef();

    const validateData = useCallback((data) => {
      let errors = [];
      if (!data?.asset && !errors.includes(SHEET_ERRORS.SHEET_MISSING)) {
        errors.push(SHEET_ERRORS.SHEET_MISSING);
      }
      if (!data?.subSheet && !errors.includes(SHEET_ERRORS.TABLE_MISSING)) {
        errors.push(SHEET_ERRORS.TABLE_MISSING);
      }

      if (!data?.view && !errors.includes(SHEET_ERRORS.VIEW_MISSING)) {
        errors.push(SHEET_ERRORS.VIEW_MISSING);
      }

      data.errors = errors;
      return data;
    }, []);

    // const confirmUpdation = useCallback(
    //   async (updateRecord) => {
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
    //       dialogContent: `You have not selected any filter on "${updateRecord?.asset?.name}". This will update all the records in "${updateRecord?.asset?.name}" table. Are you sure you want to continue?`,
    //       onCancel: () => {
    //         onSave(updateRecord, {
    //           name: updateRecord?.label || UPDATE_SHEET_RECORD_NODE.name,
    //           errors: updateRecord?.errors,
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
        let updateRecord = ref.current?.getData();
        updateRecord = validateData(updateRecord);

        // if (!updateRecord?.filter && updateRecord?.view) {
        //   confirmUpdation(updateRecord);
        //   return;
        // }
        onSave(
          updateRecord,
          {
            // name: updateRecord?.label || UPDATE_SHEET_RECORD_NODE.name,
            errors: updateRecord?.errors,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref, validateData]
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

    // return (
    //   <ExtensionDialog
    //     dialogWidth="1200px"
    //     titleProps={titleProps}
    //     onDiscard={discardHandler}
    //     onSave={saveHandler}
    //     dialogContent={
    //       <UpdateRecord
    //         ref={ref}
    //         data={currentSavedData}
    //         parentId={projectId}
    //         variables={variables}
    //         workspaceId={workspaceId}
    //       />
    //     }
    //   />
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
          name: nodeData?.name || UPDATE_SHEET_RECORD_NODE.name,
          icon: nodeData?._src || UPDATE_SHEET_RECORD_NODE._src,
          foreground:
            nodeData?.foreground || UPDATE_SHEET_RECORD_NODE.foreground,
          background:
            nodeData?.background || UPDATE_SHEET_RECORD_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={UPDATE_SHEET_RECORD_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <UpdateRecord
          ref={ref}
          canvasRef={canvasRef}
          annotation={annotation}
          data={currentSavedData}
          parentId={projectId}
          variables={variables}
          workspaceId={workspaceId}
          onSave={saveHandler}
          nodeData={nodeData}
        />
      </CommonDrawer>
    );
  }
);
export default UpdateSheetRecordDialog;
