import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import FIND_ALL_SHEET_RECORD_NODE_V2 from "./constant";
import FindAllRecord from "./FindAllRecord";
// import { SHEET_ERRORS } from "../../../utils/errorEnums";
import CommonDrawer from "../../common-components/CommonDrawer";
import cloneDeep from "lodash/cloneDeep";

const FindAllRecordDialog = forwardRef(
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
      variables,
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
    //   if (data?.record?.every((r) => !r.checked)) {
    //     if (!errors.includes(SHEET_ERRORS.SELECT_MIN_ONE_COLUMN)) {
    //       errors.push(SHEET_ERRORS.SELECT_MIN_ONE_COLUMN);
    //     }
    //   }

    //   data.errors = errors;
    //   return data;
    // }, []);

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        const findAllRecord = ref.current?.getData();

        const error = ref.current?.getError();

        const messages = Object.values(error).reduce((acc, curr) => {
          if (curr.length > 0) {
            acc.push(...curr);
          }
          return acc;
        }, []);

        onSave(
          findAllRecord,
          {
            // name: findAllRecord?.label || FIND_ALL_SHEET_RECORD_NODE_V2.name,
            errors: messages,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    const discardHandler = useCallback(
      (e) => {
        let findOneRecord = ref.current?.getData();
        let currentDataSaved = cloneDeep(data);

        delete currentDataSaved?.errors;
        delete currentDataSaved?.output;
        onDiscard(e, findOneRecord, currentDataSaved);
      },
      [data, onDiscard, ref]
    );

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
      //     <FindAllRecord
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
        onClose={() => {
          saveHandler(false);
          onDiscard();
        }}
        title={{
          name: nodeData?.name || FIND_ALL_SHEET_RECORD_NODE_V2.name,
          icon: nodeData?._src || FIND_ALL_SHEET_RECORD_NODE_V2._src,
          foreground:
            nodeData?.foreground || FIND_ALL_SHEET_RECORD_NODE_V2.foreground,
          background:
            nodeData?.background || FIND_ALL_SHEET_RECORD_NODE_V2.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={FIND_ALL_SHEET_RECORD_NODE_V2}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <FindAllRecord
          ref={ref}
          canvasRef={canvasRef}
          annotation={annotation}
          data={currentSavedData}
          parentId={parentId}
          workspaceId={workspaceId}
          assetId={assetId}
          projectId={projectId}
          variables={variables}
          onSave={saveHandler}
          nodeData={nodeData}
        />
      </CommonDrawer>
    );
  }
);
export default FindAllRecordDialog;
