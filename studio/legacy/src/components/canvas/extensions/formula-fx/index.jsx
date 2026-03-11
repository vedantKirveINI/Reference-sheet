import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import FORMULA_FX_NODE from "./constant";
import FormulaFXNode from "./FormulaFXNode";
import CommonDrawer from "../common-components/CommonDrawer";
import cloneDeep from "lodash/cloneDeep";

const FormulaFXDialog = forwardRef(
  (
    {
      data: savedData = {},
      workspaceId,
      projectId,
      variables,
      onSave = () => {},
      onDiscard = () => {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      nodeData,
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const data = cloneDeep(savedData);
    const drawerRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let fxData = ref.current?.getData();
        onSave(
          fxData,
          {
            errors: fxData?.errors || fxData?.content?.errors || [],
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
          name: nodeData?.name || FORMULA_FX_NODE.name,
          icon: nodeData?._src || FORMULA_FX_NODE._src,
          foreground: nodeData?.foreground || FORMULA_FX_NODE.foreground,
          background: nodeData?.background || FORMULA_FX_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={FORMULA_FX_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <FormulaFXNode
          ref={ref}
          data={data}
          workspaceId={workspaceId}
          projectId={projectId}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default FormulaFXDialog;
