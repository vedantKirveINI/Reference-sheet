import React, { useCallback, useEffect, useRef } from "react";
import cloneDeep from "lodash/cloneDeep";
import CommonDrawer from "../../common-components/CommonDrawer";
import FORM_TRIGGER_NODE from "./constants";
import FormTriggerNode from "./FormTriggerNode";

const FormTriggerDrawer = (
  {
    data,
    variables = {},
    onSave = () => {},
    onDiscard = () => {},
    onAddNode = () => {},
    onUpdateTitle = () => {},
    nodeData,
    workspaceId,
    sidebarActions = [],
    onSidebarActionClick = () => {},
  },
  ref
) => {
  const drawerRef = useRef();
  const currentSavedData = cloneDeep(data);

  const saveHandler = useCallback(
    (openNodeAfterCreate) => {
      let data = ref.current?.getData();
      onSave(
        data,
        {
          errors: data?.errors,
        },
        openNodeAfterCreate
      );
    },
    [onSave, ref]
  );

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
        name: nodeData?.name || FORM_TRIGGER_NODE.name,
        icon: nodeData?._src || FORM_TRIGGER_NODE._src,
        foreground: nodeData?.foreground || FORM_TRIGGER_NODE.foreground,
        background: nodeData?.background || FORM_TRIGGER_NODE.background,
        hoverDescription: nodeData?.hoverDescription,
      }}
      node={FORM_TRIGGER_NODE}
      onAddNode={onAddNode}
      onTitleChanged={onUpdateTitle}
      sidebarActions={sidebarActions}
      onSidebarActionClick={onSidebarActionClick}
    >
      <FormTriggerNode
        ref={ref}
        data={currentSavedData}
        variables={variables}
        nodeData={nodeData}
        onSave={saveHandler}
        workspaceId={workspaceId}
      />
    </CommonDrawer>
  );
};

export default FormTriggerDrawer;
