import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import MATCH_PATTERN_NODE from "./constant";
import CommonDrawer from "../../common-components/CommonDrawer";
import MatchPattern from "./MatchPattern";
import cloneDeep from "lodash/cloneDeep";
const MatchPatternDialog = forwardRef(
  (
    {
      data: savedData = {},
      onSave = () => {},
      onDiscard = () => {},
      onUpdateTitle = () => {},
      onAddNode = () => {},
      variables,
      nodeData,
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const data = cloneDeep(savedData);
    const drawerRef = useRef();
    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        const matchPatternAdvancedData = ref.current?.getData();
        onSave(matchPatternAdvancedData, {}, openNodeAfterCreate);
      },
      [onSave, ref]
    );
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
          name: nodeData?.name || MATCH_PATTERN_NODE.name,
          icon: nodeData?._src || MATCH_PATTERN_NODE._src,
          foreground: nodeData?.foreground || MATCH_PATTERN_NODE.foreground,
          background: nodeData?.background || MATCH_PATTERN_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={MATCH_PATTERN_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <MatchPattern
          ref={ref}
          data={data}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);
export default MatchPatternDialog;
