import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { JUMP_TO_TYPE } from "../constants/types";

const JUMP_TO_NODE = {
  cmsId: "jump-to",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742550036580/iterator.svg",
  name: "Jump To",
  description: "Jump to another node in the workflow",
  hoverDescription:
    "Allows the workflow to jump to a specified node, bypassing intermediate nodes.",
  type: JUMP_TO_TYPE,
  template: NODE_TEMPLATES.END,
  background: "linear-gradient(180deg, #4A90E2 0%, #6BA5E8 100%)",
  foreground: "#fff",
  dark: "#4A90E2",
  light: "#6BA5E8",
  hasTestModule: false,
  denyFromLink: false,
  denyToLink: true,
};

export default JUMP_TO_NODE;
