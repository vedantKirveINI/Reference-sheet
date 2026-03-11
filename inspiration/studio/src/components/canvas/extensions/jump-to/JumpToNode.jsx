/**
 * @deprecated Use JumpToNodeV3 from jump-to-v3/ instead.
 * This component uses the legacy TabContainer pattern and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based JumpToNodeV3.
 */
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import TabContainer from "../common-components/TabContainer";
import Configure from "./tabs/configure/Configure";
import JUMP_TO_NODE from "./constant";

const JumpToNode = forwardRef(
  (
    {
      data = {},
      nodeData = {},
      onSave = () => {},
      getNodes = () => {},
      variables = {},
    },
    ref
  ) => {
    const [selectedNodeId, setSelectedNodeId] = useState(data?.jump_to_id);
    const [messageContent, setMessageContent] = useState(
      data?.message_content || {}
    );

    useImperativeHandle(ref, () => {
      return {
        getData: () => ({
          jump_to_id: selectedNodeId,
          message_content: messageContent,
        }),
      };
    }, [selectedNodeId, messageContent]);

    const tabs = useMemo(() => {
      return [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            getNodes,
            selectedNodeId,
            setSelectedNodeId,
            data,
            nodeData,
            messageContent,
            setMessageContent,
            variables,
          },
        },
      ];
    }, [data, getNodes, nodeData, selectedNodeId, messageContent, variables]);

    return (
      <TabContainer
        tabs={tabs}
        colorPalette={{
          dark: JUMP_TO_NODE.dark,
          light: JUMP_TO_NODE.light,
          foreground: JUMP_TO_NODE.foreground,
        }}
        validTabIndices={[0]}
        onSave={onSave}
        showCommonActionFooter={true}
      />
    );
  }
);

export default JumpToNode;
