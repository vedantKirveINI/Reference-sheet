import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { updateIfElseNodeLinks } from "../../utils/canvas-utils";
import ExtensionDialog from "../common-components/ExtensionDialog";
import { IF_ELSE_TYPE } from "../constants/types";
import { getNodeSrc, validateIfElseData } from "../extension-utils";

import IF_ELSE_NODE from "./constant";
import IfElse from "./IfElse";
import _ from "lodash";
import CommonDrawer from "../common-components/CommonDrawer";

const IfElseDialog = forwardRef(
  (
    {
      data,
      variables = {},
      onSave = () => {},
      onDiscard = () => {},
      onAddNode = () => {},
      onUpdateTitle = () => {},
      nodeData,
      onUpdateNodeLinks = () => {},
      getNodes = () => {},
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const [jumpToNodes, setJumpToNodes] = useState(null);
    const [ifElseData, setIfElseData] = useState({});

    const drawerRef = useRef();

    const updateNodeLinks = useCallback(
      (ifElseRowData) => {
        const linksToBeUpdated = updateIfElseNodeLinks(ifElseRowData);
        onUpdateNodeLinks(linksToBeUpdated);
      },
      [onUpdateNodeLinks]
    );

    const saveHandler = useCallback(
      (openNodeAfterCreate = true) => {
        let ifElseData = ref.current?.getData();
        // const errors = validateIfElseData(ifElseData);
        onSave(
          ifElseData,
          {
            // description: ifElseData?.label || IF_ELSE_NODE.name,
            errors: ifElseData?.errors,
          },
          openNodeAfterCreate
        );
        updateNodeLinks(ifElseData);
      },
      [onSave, ref, updateNodeLinks]
    );

    // const discardHandler = useCallback(
    //   (e) => {
    //     let currentData = ref.current?.getData();
    //     onDiscard(e, currentData, data, ["_src", "errors", "output"]);
    //   },
    //   [data, onDiscard, ref]
    // );

    const updateJumpTo = async (jumpTo) => {
      const _src = await getNodeSrc(jumpTo, true);
      return { ...jumpTo, _src };
    };

    const updateJumpToNodesOption = useCallback(async () => {
      const response = await getNodes({
        fetchConnectableNodes: true,
      });

      let jumpToNodeOptions = [];

      for (let i = 0; i < response.length; i++) {
        const option = await updateJumpTo(response[i]);
        jumpToNodeOptions.push(option);
      }
      setJumpToNodes(jumpToNodeOptions);
    }, [getNodes]);

    const updateIfElseRowData = useCallback(async (ifElseRowData) => {
      const ifElseDataCopy = _.cloneDeep(ifElseRowData);

      if (ifElseDataCopy?.ifData) {
        for (let i = 0; i < ifElseDataCopy.ifData?.length; i++) {
          let jumpToNode = ifElseDataCopy.ifData[i].jumpTo;
          if (jumpToNode) {
            jumpToNode = await updateJumpTo(jumpToNode);
            ifElseDataCopy.ifData[i].jumpTo = jumpToNode;
          }
        }
      }

      if (ifElseDataCopy?.elseData) {
        for (let i = 0; i < ifElseDataCopy.elseData?.length; i++) {
          let jumpToNode = ifElseDataCopy.elseData[i].jumpTo;
          if (jumpToNode) {
            jumpToNode = await updateJumpTo(jumpToNode);
            ifElseDataCopy.elseData[i].jumpTo = jumpToNode;
          }
        }
      }

      setIfElseData({
        ...ifElseDataCopy,
      });
    }, []);

    useEffect(() => {
      updateJumpToNodesOption();
    }, [updateJumpToNodesOption]);

    useEffect(() => {
      updateIfElseRowData(data);
    }, [data, updateIfElseRowData]);

    // useEffect(() => {
    //   if (!data?.last_updated) {
    //     setTimeout(saveHandler, 100);
    //   }
    // }, [data?.last_updated, saveHandler]);

    return (
      <CommonDrawer
        ref={drawerRef}
        onSave={saveHandler}
        onClose={(e) => {
          saveHandler(false);
          onDiscard(e);
        }}
        title={{
          name: nodeData?.name || IF_ELSE_NODE.name,
          icon: nodeData?._src || IF_ELSE_NODE._src,
          foreground: nodeData?.foreground || IF_ELSE_NODE.foreground,
          background: nodeData?.background || IF_ELSE_NODE.background,
          hoverDescription: nodeData?.hoverDescription,
        }}
        node={IF_ELSE_NODE}
        onAddNode={onAddNode}
        onTitleChanged={onUpdateTitle}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <IfElse
          ref={ref}
          data={ifElseData}
          jumpToNodeOptions={jumpToNodes}
          variables={variables}
          onSave={saveHandler}
        />
      </CommonDrawer>
    );
  }
);
export default IfElseDialog;
