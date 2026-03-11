import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import TINYGPT_LEARNING_NODE from "./constant";
import { TINY_GPT_LEARNING_TYPE } from "../constants/types";
import TinyGPTLearning from "./TinyGPTLearning";
import CommonDrawer from "../common-components/CommonDrawer";

const TinyGPTLearningDialog = forwardRef(
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
        let tinyGPTLearningData = ref.current?.getData();
        onSave(
          tinyGPTLearningData,
          {
            name: tinyGPTLearningData?.label || TINY_GPT_LEARNING_TYPE,
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
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, saveHandler]);
    return (
      // <ExtensionDialog
      //   dialogWidth="800px"
      //   dialogHeight="800px"
      //   titleProps={titleProps}
      //   onDiscard={discardHandler}
      //   onSave={saveHandler}
      //   dialogContent={<TinyGPTLearning ref={ref} data={data} />}
      // />
      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || TINYGPT_LEARNING_NODE.name,
          icon: nodeData?._src || TINYGPT_LEARNING_NODE._src,
          foreground: nodeData?.foreground || TINYGPT_LEARNING_NODE.foreground,
          background: nodeData?.background || TINYGPT_LEARNING_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={TINYGPT_LEARNING_NODE}
        onAddNode={onAddNode}
        // PaperProps={{ "data-testid": "http-content" }}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TinyGPTLearning
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default TinyGPTLearningDialog;
