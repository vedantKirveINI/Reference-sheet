import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import ExtensionDialog from "../common-components/ExtensionDialog";
import TINYGPT_SUMMARIZER_NODE from "./constant";
import { TINY_GPT_SUMMARIZER_TYPE } from "../constants/types";
import TinyGPTSummarizer from "./TinyGPTSummarizer";
import CommonDrawer from "../common-components/CommonDrawer";

const TinyGPTSummarizerDialog = forwardRef(
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
    const drawerRef = useRef();

    // JSON.parse(JSON.stringify(data)) is done to take deep copy for deep object comparison
    const data = JSON.parse(JSON.stringify(savedData));

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let tinyGPTSummarizerData = ref.current?.getData();
        onSave(
          tinyGPTSummarizerData,
          {
            // name: tinyGPTSummarizerData?.label || TINY_GPT_SUMMARIZER_TYPE,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    // const discardHandler = useCallback(
    //   (e) => {
    //     onDiscard(e);
    //   },
    //   [onDiscard]
    // );
    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, saveHandler]);
    return (
      <CommonDrawer
        ref={drawerRef}
        title={{
          name: nodeData?.name || TINYGPT_SUMMARIZER_NODE.name,
          icon: nodeData?._src || TINYGPT_SUMMARIZER_NODE._src,
          foreground:
            nodeData?.foreground || TINYGPT_SUMMARIZER_NODE.foreground,
          background:
            nodeData?.background || TINYGPT_SUMMARIZER_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        node={TINYGPT_SUMMARIZER_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TinyGPTSummarizer ref={ref} data={data} onSave={saveHandler} />
      </CommonDrawer>
    );
  }
);

export default TinyGPTSummarizerDialog;
