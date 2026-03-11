import React, { forwardRef, useCallback, useEffect } from "react";
import EXECUTE_QUERY_NODE from "./constant";
import ExecuteQuery from "./ExecuteQuery";
import ExtensionDialog from "../../common-components/ExtensionDialog";

const ExecuteQueryDialog = forwardRef(
  (
    {
      titleProps = {
        label: EXECUTE_QUERY_NODE.name,
        icon: EXECUTE_QUERY_NODE._src,
        foreground: EXECUTE_QUERY_NODE.foreground,
        background: EXECUTE_QUERY_NODE.background,
      },
      projectId,
      data = {},
      onSave = () => {},
      onDiscard = () => {},
      variables,
    },
    ref
  ) => {
    const saveHandler = useCallback(() => {
      onSave(ref.current?.getData());
    }, [onSave, ref]);
    useEffect(() => {
      if (!data?.last_updated) {
        saveHandler();
      }
    }, [data?.last_updated, saveHandler]);
    return (
      <ExtensionDialog
        dialogHeight="auto"
        titleProps={titleProps}
        onDiscard={onDiscard}
        onSave={saveHandler}
        dialogContent={
          <ExecuteQuery
            ref={ref}
            data={data}
            variables={variables}
            parentId={projectId}
          />
        }
      />
    );
  }
);
export default ExecuteQueryDialog;
