import React, { forwardRef, useRef } from "react";
import CommonDrawer from "../../common-components/CommonDrawer";
import AGENT_INPUT_NODE from "./constant";
import SelectTrigger from "./SelectTrigger";
import { getAgentNode } from "../../extension-utils";
import { NODE_TEMPLATES } from "../../../templates";
const AgentInputNodeDrawer = forwardRef(
  (
    {
      onSave = () => {},
      onDiscard = () => {},
      sidebarActions = [],
      onSidebarActionClick = () => {},
    },
    ref
  ) => {
    const drawerRef = useRef();
    const triggerTypeChangedHandler = (triggerType) => {
      const node = getAgentNode(triggerType);
      onSave({ ...node, template: NODE_TEMPLATES.AGENT_INPUT }, null, false);
    };

    return (
      <CommonDrawer
        ref={drawerRef}
        title={{
          name: AGENT_INPUT_NODE.name,
          icon: AGENT_INPUT_NODE._src,
          foreground: AGENT_INPUT_NODE.foreground,
          background: AGENT_INPUT_NODE.background,
        }}
        onClose={(e) => {
          onDiscard(e);
        }}
        showTitleEditButton={false}
        node={AGENT_INPUT_NODE}
        sidebarActions={sidebarActions}
        onSidebarActionClick={onSidebarActionClick}
      >
        <SelectTrigger onTriggerTypeChange={triggerTypeChangedHandler} />
      </CommonDrawer>
    );
  }
);

export default AgentInputNodeDrawer;
