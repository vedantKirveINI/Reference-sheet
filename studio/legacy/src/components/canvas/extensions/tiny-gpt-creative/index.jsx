import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import TINYGPT_CREATIVE_NODE from "./constant";
import { TINY_GPT_CREATIVE_TYPE } from "../constants/types";
import TinyGPTCreative from "./TinyGPTCreative";
import CommonDrawer from "../common-components/CommonDrawer";

const TinyGPTCreativeDialog = forwardRef(
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
    // JSON.parse(JSON.stringify(data)) is done to take deep copy for deep object comparison
    const data = JSON.parse(JSON.stringify(savedData));
    const drawerRef = useRef();
    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let tinyGPTCreativeData = ref.current?.getData();
        onSave(
          tinyGPTCreativeData,
          {
            name: tinyGPTCreativeData?.label || TINY_GPT_CREATIVE_TYPE,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    const discardHandler = useCallback(
      (e) => {
        onDiscard(e);
      },
      [onDiscard]
    );
    useEffect(() => {
      if (!data?.last_updated) {
        saveHandler();
      }
    }, [data?.last_updated, saveHandler]);
    return (
      // <ExtensionDialog
      //   dialogWidth="800px"
      //   dialogHeight="800px"
      //   titleProps={titleProps}
      //   onDiscard={discardHandler}
      //   onSave={saveHandler}
      //   dialogContent={<TinyGPTCreative ref={ref} data={data} />}
      // />

      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || TINYGPT_CREATIVE_NODE.name,
          icon: nodeData?._src || TINYGPT_CREATIVE_NODE._src,
          foreground: nodeData?.foreground || TINYGPT_CREATIVE_NODE.foreground,
          background: nodeData?.background || TINYGPT_CREATIVE_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={TINYGPT_CREATIVE_NODE}
        onAddNode={onAddNode}
        // PaperProps={{ "data-testid": "http-content" }}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TinyGPTCreative
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default TinyGPTCreativeDialog;
