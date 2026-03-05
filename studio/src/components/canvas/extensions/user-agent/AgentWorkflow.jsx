import { forwardRef, useMemo } from "react";
import TabContainer from "../common-components/TabContainer";
import AGENT_WORKFLOW_NODE from "./constant";
import Configure from "./tabs/configure";

const AgentWorkflow = forwardRef(
  ({ variables, onSave = () => {}, nodeData }, ref) => {
    const tabs = useMemo(() => {
      return [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            ref: ref,
            variables,
            nodeData,
          },
        },
      ];
    }, [variables]);

    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: AGENT_WORKFLOW_NODE.dark,
          light: AGENT_WORKFLOW_NODE.light,
          foreground: AGENT_WORKFLOW_NODE.foreground,
        }}
        onSave={onSave}
        validTabIndices={[0]}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default AgentWorkflow;
