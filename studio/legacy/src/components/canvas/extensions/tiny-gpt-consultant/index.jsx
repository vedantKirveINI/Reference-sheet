import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import TINYGPT_CONSULTANT_NODE from "./constant";
import { TINY_GPT_CONSULTANT_TYPE } from "../constants/types";
import TinyGPTConsultant from "./TinyGPTConsultant";
import CommonDrawer from "../common-components/CommonDrawer";

const TinyGPTConsultantDialog = forwardRef(
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
        let tinyGPTConsultantData = ref.current?.getData();
        onSave(
          tinyGPTConsultantData,
          {
            name: tinyGPTConsultantData?.label || TINY_GPT_CONSULTANT_TYPE,
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
      //   dialogContent={<TinyGPTConsultant ref={ref} data={data} />}
      // />

      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || TINYGPT_CONSULTANT_NODE.name,
          icon: nodeData?._src || TINYGPT_CONSULTANT_NODE._src,
          foreground:
            nodeData?.foreground || TINYGPT_CONSULTANT_NODE.foreground,
          background:
            nodeData?.background || TINYGPT_CONSULTANT_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={TINYGPT_CONSULTANT_NODE}
        onAddNode={onAddNode}
        // PaperProps={{ "data-testid": "http-content" }}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <TinyGPTConsultant
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default TinyGPTConsultantDialog;
