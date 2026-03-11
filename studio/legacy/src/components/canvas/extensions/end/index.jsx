import React, { forwardRef, useCallback, useEffect, useRef } from "react";

import { END_NODE_ERRORS } from "../../utils/errorEnums";
import ExtensionDialog from "../common-components/ExtensionDialog";

import END_NODE from "./constant";
import EndNode from "./EndNode";
import CommonDrawer from "../common-components/CommonDrawer";

const EndNodeDialog = forwardRef(
  (
    {
      data: savedData = {},
      variables = {},
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

    // const isFxTypeWithData = (data) => {
    //   return (
    //     data?.type === "fx" &&
    //     Array.isArray(data?.blocks) &&
    //     data?.blocks.length > 0
    //   );
    // };

    // const validateFn = useCallback((input, errors) => {
    //   if (input?.type === "ARRAY" || input?.type === "OBJECT") {
    //     if (!input?.key && !errors.includes(END_NODE_ERRORS.EMPTY_KEY)) {
    //       errors.push(END_NODE_ERRORS.EMPTY_KEY);
    //     }
    //   } else {
    //     if (
    //       !input?.key &&
    //       isFxTypeWithData(input?.default) &&
    //       input?.type &&
    //       !errors.includes(END_NODE_ERRORS.EMPTY_KEY)
    //     ) {
    //       errors.push(END_NODE_ERRORS.EMPTY_KEY);
    //     }
    //   }
    // }, []);

    // const validateData = useCallback(
    //   (data) => {
    //     let errors = [];

    //     data?.outputs?.forEach((output) => {
    //       validateFn(output, errors);
    //     });

    //     data.errors = errors;
    //     return data;
    //   },
    //   [validateFn]
    // );

    const saveHandler = useCallback(
      (openNodeAfterCreate) => {
        let endNodeData = ref.current?.getData();
        // endNodeData = validateData(endNodeData);
        onSave(
          endNodeData,
          {
            // name: endNodeData?.label,
            errors: endNodeData?.errors,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    // const discardHandler = useCallback(
    //   (e) => {
    //     const endNodeData = ref.current?.getData();
    //     onDiscard(e, endNodeData?.outputs, data?.outputs);
    //   },
    //   [data?.outputs, onDiscard, ref]
    // );
    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, saveHandler]);
    return (
      // <ExtensionDialog
      //   titleProps={titleProps}
      //   onDiscard={discardHandler}
      //   onSave={saveHandler}
      //   dialogContent={<EndNode ref={ref} data={data} variables={variables} />}
      // />

      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || END_NODE.name,
          icon: nodeData?._src || END_NODE._src,
          foreground: nodeData?.foreground || END_NODE.foreground,
          background: nodeData?.background || END_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={END_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <EndNode
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default EndNodeDialog;
