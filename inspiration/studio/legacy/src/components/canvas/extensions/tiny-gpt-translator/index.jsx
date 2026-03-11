import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import TINYGPT_TRANSLATOR_NODE from "./constant";
import { TINY_GPT_TRANSLATOR_TYPE } from "../constants/types";
import TinyGPTTranslator from "./TinyGPTTranslator";
import CommonDrawer from "../common-components/CommonDrawer";

const TinyGPTTranslatorDialog = forwardRef(
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
        let tinyGPTTranslatorData = ref.current?.getData();
        onSave(
          tinyGPTTranslatorData,
          {
            name: tinyGPTTranslatorData?.label || TINY_GPT_TRANSLATOR_TYPE,
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
      //   dialogContent={<TinyGPTTranslator ref={ref} data={data} />}
      // />

      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || TINYGPT_TRANSLATOR_NODE.name,
          icon: nodeData?._src || TINYGPT_TRANSLATOR_NODE._src,
          foreground:
            nodeData?.foreground || TINYGPT_TRANSLATOR_NODE.foreground,
          background:
            nodeData?.background || TINYGPT_TRANSLATOR_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={TINYGPT_TRANSLATOR_NODE}
        onAddNode={onAddNode}
        // PaperProps={{ "data-testid": "http-content" }}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TinyGPTTranslator
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default TinyGPTTranslatorDialog;
