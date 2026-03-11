import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import ExtensionDialog from "../common-components/ExtensionDialog";
import TINYGPT_WRITER_NODE from "./constant";
import { TINY_GPT_WRITER_TYPE } from "../constants/types";
import { TinyGPTWriter } from "./TinyGPTWriter";
import CommonDrawer from "../common-components/CommonDrawer";

const TinyGPTWriterDialog = forwardRef(
  (
    {
      data: savedData = {},
      workspaceId,
      projectId,
      variables,
      onSave = () => {},
      onDiscard = () => {},
      sidebarActions = [],
      onSidebarActionClick = () => {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      nodeData,
    },
    ref
  ) => {
    // JSON.parse(JSON.stringify(data)) is done to take deep copy for deep object comparison
    const data = JSON.parse(JSON.stringify(savedData));

    const drawerRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let tinyGPTResearcherData = ref.current?.getData();
        onSave(
          tinyGPTResearcherData,
          {
            // name: tinyGPTResearcherData?.label || TINY_GPT_WRITER_TYPE,
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
        saveHandler();
      }
    }, [data?.last_updated, saveHandler]);
    return (
      <CommonDrawer
        ref={drawerRef}
        title={{
          name: nodeData?.name || TINYGPT_WRITER_NODE.name,
          icon: nodeData?._src || TINYGPT_WRITER_NODE._src,
          foreground: nodeData?.foreground || TINYGPT_WRITER_NODE.foreground,
          background: nodeData?.background || TINYGPT_WRITER_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        node={TINYGPT_WRITER_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TinyGPTWriter ref={ref} data={data} onSave={saveHandler} />
      </CommonDrawer>
    );
  }
);

export default TinyGPTWriterDialog;
