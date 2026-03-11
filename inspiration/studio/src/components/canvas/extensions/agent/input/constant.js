import { NODE_TEMPLATES } from "../../../templates";
import { AGENT_INPUT_TYPE } from "../../constants/types";

const AGENT_INPUT_NODE = {
  _src: "https://ccc.oute.app/test/1738677583891/workflow_icon",
  name: "Agent Input",
  description: "",
  type: AGENT_INPUT_TYPE,
  template: NODE_TEMPLATES.AGENT_INPUT,
  background: "linear-gradient(135deg, #8133F1 0%, #360083 100%)",
  foreground: "#fff",
  dark: "#360083",
  light: "#8133F1",
  hasTestModule: false,
  canSkipTest: true,
  viewSpot: "0 0.5",
};

export default AGENT_INPUT_NODE;
