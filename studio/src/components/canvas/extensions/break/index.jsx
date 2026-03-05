import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import Break from "./Break";
import BREAK_NODE from "./constant";
import { ExtensionShell } from "../components/shell";

const BreakDialog = forwardRef(
  (
    {
      data: savedData = {},
      variables,
      nodeData = {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      onSave = () => {},
      onDiscard = () => {},
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const data = JSON.parse(JSON.stringify(savedData));
    const shellRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let breakData = ref.current?.getData();
        onSave(breakData, {}, openNodeAfterCreate);
      },
      [onSave, ref]
    );

    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, saveHandler]);

    return (
      <ExtensionShell
        ref={shellRef}
        title={{
          name: nodeData?.name || BREAK_NODE.name,
          icon: nodeData?._src || BREAK_NODE._src,
          foreground: nodeData?.foreground || BREAK_NODE.foreground,
          background: nodeData?.background || BREAK_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={BREAK_NODE}
        showSidebar={sidebarActions.length > 0}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        onTitleChanged={onUpdateTitle}
      >
        <Break
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </ExtensionShell>
    );
  }
);

export default BreakDialog;
