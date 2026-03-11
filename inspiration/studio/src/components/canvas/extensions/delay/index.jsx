import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import DELAY_NODE from "./constant";
import { ExtensionShell } from "../components/shell";
import Delay from "./Delay";

const DelayDialog = forwardRef(
  (
    {
      data: savedData = {},
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
    const data = JSON.parse(JSON.stringify(savedData));
    const shellRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let delayData = ref.current?.getData();
        onSave(delayData, {}, openNodeAfterCreate);
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
          name: nodeData?.name || DELAY_NODE.name,
          icon: nodeData?._src || DELAY_NODE._src,
          foreground: nodeData?.foreground || DELAY_NODE.foreground,
          background: nodeData?.background || DELAY_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={DELAY_NODE}
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
        <Delay
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </ExtensionShell>
    );
  }
);

export default DelayDialog;
