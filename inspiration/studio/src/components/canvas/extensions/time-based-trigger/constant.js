import { TIME_BASED_TRIGGER } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TIME_BASED_TRIGGER_NODE = {
  cmsId: "time-based-trigger",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742543357097/timebased.svg",
  name: "Time Based Trigger",
  hoverDescription:
    "Starts automatically at a scheduled time, triggering workflow execution at that moment.",
  type: TIME_BASED_TRIGGER,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #1E3C9B 27.7%, #2E75E2 100%)",
  foreground: "#fff",
  dark: "#1E3C9B",
  light: "#2E75E2",
  hasTestModule: false,
  canSkipTest: false,
  denyFromLink: true,
};

export default TIME_BASED_TRIGGER_NODE;
