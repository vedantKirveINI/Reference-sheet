import { forwardRef, useCallback, useRef } from "react";
import SHEET_TRIGGER_NODE from "./constant";
import cloneDeep from "lodash/cloneDeep";
import CommonDrawer from "../../common-components/CommonDrawer";
import SheetTrigger from "../../triggers/table/SheetTrigger";

const SheetTriggerDialog = forwardRef(
  (
    {
      projectId,
      workspaceId,
      assetId,
      data,
      nodeData,
      onUpdateTitle,
      onAddNode,
      sidebarActions,
      onSidebarActionClick,
      onSave = () => {},
      onDiscard = () => {},
    },
    ref
  ) => {
    const currentSavedData = cloneDeep(data);
    const drawerRef = useRef();

    const onSaveHandler = useCallback(
      async (openNodeAfterCreate = true) => {
        const nodeData = await ref.current?.getData();
        const errors = ref.current?.validateData();

        onSave(
          nodeData,
          {
            errors: errors,
            // name: nodeData?.label || SHEET_TRIGGER_NODE.name,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    return (
      <CommonDrawer
        ref={drawerRef}
        onSave={onSaveHandler}
        onClose={(e) => {
          onSaveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || SHEET_TRIGGER_NODE.name,
          icon: nodeData?._src || SHEET_TRIGGER_NODE._src,
          foreground: nodeData?.foreground || SHEET_TRIGGER_NODE.foreground,
          background: nodeData?.background || SHEET_TRIGGER_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={SHEET_TRIGGER_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <SheetTrigger
          data={currentSavedData}
          parentId={projectId}
          workspaceId={workspaceId}
          assetId={assetId}
          onSaveHandler={onSaveHandler}
          ref={ref}
        />
      </CommonDrawer>
    );
  }
);

export default SheetTriggerDialog;
