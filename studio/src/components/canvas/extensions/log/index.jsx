import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import LOG_NODE from "./constant";
import { ExtensionShell } from "../components/shell";
import Log from "./Log";
import _ from "lodash";

const LogDialog = forwardRef(
  (
    {
      data,
      variables,
      onSave = () => {},
      onDiscard = () => {},
      onUpdateTitle = () => {},
      nodeData,
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const currentSavedData = _.cloneDeep(data);
    const shellRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let logData = ref.current?.getData();
        onSave(
          logData,
          {
            name: logData?.label || "Log",
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    const discardHandler = useCallback(
      (e) => {
        const logData = ref.current?.getData();
        onDiscard(e, logData?.content, data?.content);
      },
      [data?.content, onDiscard, ref]
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
          name: nodeData?.name || LOG_NODE.name,
          icon: nodeData?._src || LOG_NODE._src,
          foreground: nodeData?.foreground || LOG_NODE.foreground,
          background: nodeData?.background || LOG_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={LOG_NODE}
        showSidebar={sidebarActions.length > 0}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
        onClose={(e) => {
          saveHandler(false);
          discardHandler(e);
        }}
        onSave={saveHandler}
        onTitleChanged={onUpdateTitle}
        drawerWidth="800px"
      >
        <Log ref={ref} data={currentSavedData} variables={variables} />
      </ExtensionShell>
    );
  }
);

export default LogDialog;
