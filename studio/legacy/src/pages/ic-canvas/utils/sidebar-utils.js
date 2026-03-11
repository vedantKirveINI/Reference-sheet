import { CANVAS_MODES } from "../../../module/constants";
import React from "react";

const HelpAndResources = React.lazy(() =>
  import("@oute/oute-ds.common.molecule.help-and-resources")
);
const AddComponentDialog = React.lazy(() =>
  import("../../../module/search/index")
);
const ParamsComponent = React.lazy(() =>
  import("@oute/oute-ds.common.molecule.params-component")
);
const JumpToNode = React.lazy(() =>
  import("@oute/oute-ds.common.molecule.jump-to-node")
);
// Dynamic import for named export
const ThemeManager = React.lazy(() =>
  import("@oute/oute-ds.atom.theme-manager").then((module) => ({
    default: module.ThemeManager,
  }))
);
const CommonAccountActions = React.lazy(() =>
  import("@oute/icdeployment.molecule.common-account-actions")
);

export const getSidebarPanel = (id) => {
  if (id === "help") {
    return HelpAndResources;
  } else if (id === "add-nodes") {
    return AddComponentDialog;
  } else if (id === "global-params") {
    return ParamsComponent;
  } else if (id === "jump-to-node") {
    return JumpToNode;
  } else if (id === "theme-manager") {
    return ThemeManager;
  }
};

export const getSidebarActions = (mode) => {
  let actions = [
    {
      id: "add-nodes",
      name: "Add Node",
      icon: "OUTEAddIcon",
    },
    {
      id: "jump-to-node",
      name: "Jump To Node",
      icon: "OUTEJumpToIcon",
    },
    {
      seperator: true,
    },
    {
      id: "global-params",
      name: "Global Params",
      icon: "OUTEGlobeIcon",
    },
    {
      seperator: true,
    },
    {
      id: "help",
      name: "Help and Resources",
      icon: "OUTEHelpIcon",
    },
    {
      id: "intercom",
      name: "Chat with us",
      icon: "OUTESupportAgentIcon",
      position: "end",
      disableActive: true,
    },
    {
      id: "account",
      name: "My Account",
      position: "end",
      disableActive: true,
      component: CommonAccountActions,
    },
  ];

  if (mode === CANVAS_MODES.WORKFLOW_CANVAS) {
    actions.splice(5, 0, {
      id: "theme-manager",
      name: "Theme Manager",
      icon: "OUTEPaletteIcon",
    });
  }

  return actions;
};
