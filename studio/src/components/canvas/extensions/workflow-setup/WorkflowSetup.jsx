import { forwardRef, useMemo } from "react";
import TabContainer from "../common-components/TabContainer";
import WORKFLOW_SETUP_NODE from "./constant";
import Configure from "./tabs/configure";

const WorkflowSetup = forwardRef(
  (
    { data = {}, projectId, workspaceId, variables, onSave = () => {} },
    ref
  ) => {
    const tabs = useMemo(() => {
      return [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            ref: ref,
            data: data,
            projectId: projectId,
            variables,
            workspaceId,
          },
        },
      ];
    }, [data, projectId, variables, workspaceId]);

    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: WORKFLOW_SETUP_NODE.dark,
          light: WORKFLOW_SETUP_NODE.light,
          foreground: WORKFLOW_SETUP_NODE.foreground,
        }}
        onSave={onSave}
        validTabIndices={[0]}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default WorkflowSetup;
