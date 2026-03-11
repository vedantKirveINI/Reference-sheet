import extensionIcons from "../../assets/extensions";
import { TINY_GPT_WRITER_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TINYGPT_WRITER_NODE = {
  _src: extensionIcons.tinyGPTResearcher,
  name: "Tiny GPT Writer",
  type: TINY_GPT_WRITER_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6200EE 27.7%, #A676EA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#6200EE",
  light: "#A676EA",
  hasTestModule: false,
  canSkipTest: true,
};

export const CONTENT_TYPE = {
  ARTICLE: "Article",
  EMAIL: "Email",
  SOCIAL_MEDIA_POST: "Social Media Post",
};

export const OUTLINE_STRUCTURE = {
  GENERATE_OUTLINE: "Generate Outline",
  DIRECT_WRITING: "Direct Writing",
};

export const REVISION_CONTROL = {
  DRAFT: "Draft",
  FINAL_VERSION: "Final Version",
  ITERATIVE_REVISIONS: "Iterative Revisions",
};

export const TONE_SELECTION = {
  CONVERSATIONAL: "Conversational",
  FORMAL: "Formal",
  INFORMAL: "Informal",
  PERSUASIVE: "Persuasive",
};

export default TINYGPT_WRITER_NODE;
