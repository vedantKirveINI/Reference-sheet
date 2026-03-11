import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { HITL_TYPE } from "../constants/types";

const HITL_NODE = {
  cmsId: "hitl",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1745997356118/Human%20in%20the%20loop%20icon.svg",
  name: "Human in the loop",
  type: HITL_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(196deg, #7D007D 2.15%, #C800C8 77.96%)", //"#be63f9",
  foreground: "#fff",
  dark: "rgb(125, 0, 125)",
  light: "rgb(200, 0, 200)",
  hasTestModule: true,
  canSkipTest: false,
  premium: true,
};

export const TEMPLATE_BUTTONS = {
  approval: [
    { label: "Approve", value: "Approve", color: "green" },
    { label: "Reject", value: "Reject", color: "red" },
  ],
  categorization: [
    { label: "Stage 1", value: "Stage 1", color: "blue" },
    { label: "Stage 2", value: "Stage 2", color: "orange" },
    { label: "Stage 3", value: "Stage 3", color: "gray" },
  ],
  escalation: [
    { label: "Escalate", value: "Escalate", color: "red" },
    { label: "Forward", value: "Forward", color: "blue" },
    { label: "Defer", value: "Defer", color: "gray" },
  ],
};

export const FILE_TYPES = [
  { label: "Image", value: "image" },
  { label: "PDF", value: "pdf" },
  { label: "Document", value: "document" },
  { label: "Audio", value: "audio" },
  { label: "Video", value: "video" },
  { label: "Compressed", value: "compressed" },
  { label: "Other", value: "other" },
];

export const SUMMARY_CONTENT_TYPES = [
  { label: "Text", value: "text" },
  { label: "HTML", value: "html" },
];

export default HITL_NODE;
