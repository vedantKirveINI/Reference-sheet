import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import ExtensionDialog from "../common-components/ExtensionDialog";
import TINYGPT_RESEARCHER_NODE from "./constant";
import { TINY_GPT_RESEARCHER_TYPE } from "../constants/types";
import TinyGPTResearcher from "./TinyGPTResearcher";
import CommonDrawer from "../common-components/CommonDrawer";

const TinyGPTResearcherDialog = forwardRef(
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
        let tinyGPTResearcherData = ref.current?.getData();
        onSave(
          tinyGPTResearcherData,
          {
            // name: tinyGPTResearcherData?.label || TINY_GPT_RESEARCHER_TYPE,
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
          name: nodeData?.name || TINYGPT_RESEARCHER_NODE.name,
          icon: nodeData?._src || TINYGPT_RESEARCHER_NODE._src,
          foreground:
            nodeData?.foreground || TINYGPT_RESEARCHER_NODE.foreground,
          background:
            nodeData?.background || TINYGPT_RESEARCHER_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        onSave={saveHandler}
        node={TINYGPT_RESEARCHER_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TinyGPTResearcher ref={ref} data={data} onSave={saveHandler} />
      </CommonDrawer>
    );
  }
);

export default TinyGPTResearcherDialog;
