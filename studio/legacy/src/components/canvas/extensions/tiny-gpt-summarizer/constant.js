import extensionIcons from "../../assets/extensions";
import { TINY_GPT_SUMMARIZER_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TINYGPT_SUMMARIZER_NODE = {
  _src: extensionIcons.tinyGPTResearcher,
  name: "Tiny GPT Summarizer",
  description: "",
  type: TINY_GPT_SUMMARIZER_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6200EE 27.7%, #A676EA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#6200EE",
  light: "#A676EA",
  hasTestModule: false,
  canSkipTest: true,
};

export const FORMAT_SELECTION = {
  BULLET_POINTS: "Bullet Points",
  PARAGRAPH: "Paragraph",
  EXECUTIVE_SUMMARY: "Executive Summary",
};

export const LANGUAGE_SIMPLICITY_LEVEL = {
  SIMPLE: "Simple",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const SUMMARY_LENGTH_SPECIFICATION = {
  BREIF: "Breif",
  DETAILED: "Detailed",
};

export default TINYGPT_SUMMARIZER_NODE;
