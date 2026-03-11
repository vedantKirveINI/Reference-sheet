import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import cloneDeep from "lodash/cloneDeep";
import TIME_BASED_TRIGGER_NODE from "./constant";
import CommonDrawer from "../common-components/CommonDrawer";
import TimeBasedTrigger from "../triggers/time-based/TimeBasedTrigger";

const TimeBasedTriggerDialog = forwardRef(
  (
    {
      data: savedData = {},
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
        const data = ref.current?.getData();
        const errors = ref.current?.validateData() || [];
        onSave(data, { errors }, openNodeAfterCreate);
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
        title={{
          name: nodeData?.name || TIME_BASED_TRIGGER_NODE.name,
          icon: nodeData?._src || TIME_BASED_TRIGGER_NODE._src,
          foreground:
            nodeData?.foreground || TIME_BASED_TRIGGER_NODE.foreground,
          background:
            nodeData?.background || TIME_BASED_TRIGGER_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        node={TIME_BASED_TRIGGER_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TimeBasedTrigger ref={ref} data={data} onSave={saveHandler} />
      </CommonDrawer>
    );
  }
);

export default TimeBasedTriggerDialog;
