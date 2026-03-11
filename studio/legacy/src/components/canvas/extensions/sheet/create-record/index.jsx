import React, { forwardRef, useCallback, useRef } from "react";
import CREATE_SHEET_RECORD_NODE from "./constant";
import CreateRecord from "./CreateRecord";
import { SHEET_ERRORS } from "../../../utils/errorEnums";
import _ from "lodash";
import CommonDrawer from "../../common-components/CommonDrawer";
const CreateSheetRecordDialog = forwardRef(
  (
    {
      canvasRef,
      annotation,
      projectId,
      workspaceId,
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
    const currentSavedData = _.cloneDeep(data);

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

      data?.record?.map((r) => {
        if (
          r.required &&
          r.value?.blocks?.length === 0 &&
          !errors.includes(SHEET_ERRORS.MISSING_REQUIRED_FIELD)
        ) {
          errors.push(SHEET_ERRORS.MISSING_REQUIRED_FIELD);
        }
      });

      data.errors = errors;
      return data;
    }, []);

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let createRecord = ref.current?.getData();
        createRecord = validateData(createRecord);
        onSave(
          createRecord,
          {
            // name: createRecord?.label || CREATE_SHEET_RECORD_NODE.name,
            errors: createRecord?.errors,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref, validateData]
    );

    const discardHandler = useCallback(
      (e) => {
        let currentData = ref.current?.getData();
        currentData = _.cloneDeep(currentData);

        let currentSavedData = _.cloneDeep(data);
        delete currentSavedData?.errors;
        delete currentSavedData?.output;

        onDiscard(e, currentData, currentSavedData);
      },
      [data, onDiscard, ref]
    );
    // useEffect(() => {
    //   if (!data?.last_updated) {
    //     setTimeout(saveHandler, 100);
    //   }
    // }, [data?.last_updated, saveHandler]);
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
export default CreateSheetRecordDialog;
