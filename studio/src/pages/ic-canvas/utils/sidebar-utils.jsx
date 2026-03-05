import { CANVAS_MODES } from "../../../module/constants";
import { MODE } from "../../../constants/mode";
import {
  HelpAndResources,
  Search as AddComponentDialog,
  JumpToNode as JumpToNodeV2,
  CommonAccountActions,
} from "../../../module";
import { GlobalVariablesPanelWrapper } from "../../../module/panels/GlobalVariables";
import { ThemeManagerPanelWrapper } from "../../../module/panels/ThemeManager";
import { icons } from "@/components/icons";
import {
  Navigation,
  Globe,
  HelpCircle,
  Headset,
  Palette,
  FileText,
  Plus,
} from "lucide-react";

export const getSidebarPanel = (id) => {
  if (id === "help") {
    return HelpAndResources;
  } else if (id === "add-nodes") {
    return AddComponentDialog;
  } else if (id === "global-params") {
    return GlobalVariablesPanelWrapper;
  } else if (id === "jump-to-node") {
    return JumpToNodeV2;
  } else if (id === "theme-manager") {
    return ThemeManagerPanelWrapper;
  }
};

export const getSidebarActions = (mode) => {
  let actions = [
    {
      id: "add-nodes",
      name: "Add Node",
      icon: Plus,
    },
    {
      id: "jump-to-node",
      name: "Jump To Node",
      icon: icons.search,
    },
    {
      seperator: true,
    },
    {
      id: "global-params",
      name: "Global Params",
      icon: Globe,
    },
    {
      seperator: true,
    },
    {
      id: "help",
      name: "Help and Resources",
      icon: HelpCircle,
    },
    {
      id: "intercom",
      name: "Chat with us",
      icon: Headset,
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
      icon: Palette,
    });
  }

  if (mode === MODE.SEQUENCE_CANVAS) {
    const helpIndex = actions.findIndex((a) => a.id === "help");
    if (helpIndex !== -1) {
      actions.splice(helpIndex, 0, {
        id: "execution-history",
        name: "Execution History",
        icon: FileText,
      });
    }
  }

  return actions;
};
