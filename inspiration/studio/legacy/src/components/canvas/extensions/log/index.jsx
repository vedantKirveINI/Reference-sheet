import React, { forwardRef, useCallback, useEffect } from "react";

import ExtensionDialog from "../common-components/ExtensionDialog";

import LOG_NODE from "./constant";
import Log from "./Log";
import _ from "lodash";

const LogDialog = forwardRef(
  (
    {
      data,
      variables,
      titleProps = {
        label: LOG_NODE.name,
        icon: LOG_NODE._src,
        foreground: LOG_NODE.foreground,
        background: LOG_NODE.background,
      },
      onSave = () => {},
      onDiscard = () => {},
    },
    ref
  ) => {
    // _.cloneDeep(data) is done to take deep copy for deep object comparison
    const currentSavedData = _.cloneDeep(data);

    const saveHandler = useCallback(() => {
      let logData = ref.current?.getData();
      onSave(logData, {
        name: logData?.label || "Log",
      });
    }, [onSave, ref]);

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
      <ExtensionDialog
        dialogWidth="800px"
        dialogHeight="500px"
        titleProps={titleProps}
        onDiscard={discardHandler}
        onSave={saveHandler}
        dialogContent={
          <Log ref={ref} data={currentSavedData} variables={variables} />
        }
      />
    );
  }
);

export default LogDialog;
