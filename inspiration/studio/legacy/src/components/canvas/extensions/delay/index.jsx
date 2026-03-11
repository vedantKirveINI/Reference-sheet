import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import DELAY_NODE from "./constant";
import CommonDrawer from "../common-components/CommonDrawer";
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
    const drawerRef = useRef();

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
      //   <ExtensionDialog
      //   dialogWidth="800px"
      //   dialogHeight="400px"
      //   titleProps={titleProps}
      //   onDiscard={onDiscard}
      //   onSave={() => saveHandler(false)}
      //   dialogContent={<Delay ref={ref} data={data} />}
      // />

      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || DELAY_NODE.name,
          icon: nodeData?._src || DELAY_NODE._src,
          foreground: nodeData?.foreground || DELAY_NODE.foreground,
          background: nodeData?.background || DELAY_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={DELAY_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <Delay
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default DelayDialog;
