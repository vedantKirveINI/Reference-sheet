import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import _ from "lodash";

import ArrayAggregator from "./ArrayAggregator";
import ARRAY_AGGREGATOR_NODE from "./constant";
import CommonDrawer from "../common-components/CommonDrawer";

const ArrayAggregatorDialog = forwardRef(
  (
    {
      data,
      variables = {},
      onSave = () => {},
      onDiscard = () => {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      nodeData,
      getNodes,
      workspaceId,
      projectId,
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    // _.cloneDeep(data) is done to take deep copy for deep object comparison
    const currentSavedData = _.cloneDeep(data);

    const drawerRef = useRef();

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        const arrayAggregatorData = ref.current?.getData();
        // arrayAggregatorData = validateData(arrayAggregatorData);
        onSave(
          arrayAggregatorData,
          {
            // errors: arrayAggregatorData?.errors,
            // name: arrayAggregatorData?.label || ARRAY_AGGREGATOR_TYPE,
          },
          openNodeAfterCreate
        );
      },
      [onSave, ref]
    );

    // const discardHandler = useCallback(
    //   (e) => {
    //     const arrayAggregatorData = ref.current?.getData();
    //     onDiscard(e, arrayAggregatorData?.content, data?.content);
    //   },
    //   [data?.content, onDiscard, ref]
    // );
    useEffect(() => {
      if (!data?.last_updated) {
        setTimeout(saveHandler, 100);
      }
    }, [data?.last_updated, saveHandler]);

    return (
      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || ARRAY_AGGREGATOR_NODE.name,
          icon: nodeData?._src || ARRAY_AGGREGATOR_NODE._src,
          foreground: nodeData?.foreground || ARRAY_AGGREGATOR_NODE.foreground,
          background: nodeData?.background || ARRAY_AGGREGATOR_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={ARRAY_AGGREGATOR_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <ArrayAggregator
          ref={ref}
          data={currentSavedData}
          workspaceId={workspaceId}
          projectId={projectId}
          variables={variables}
          getNodes={getNodes}
          nodeData={nodeData}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);

export default ArrayAggregatorDialog;
