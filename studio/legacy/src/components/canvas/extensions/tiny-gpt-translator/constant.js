import extensionIcons from "../../assets/extensions";
import { TINY_GPT_TRANSLATOR_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TINYGPT_TRANSLATOR_NODE = {
  _src: extensionIcons.tinyGptTranslator,
  name: "Tiny GPT Translator",
  description: "",
  type: TINY_GPT_TRANSLATOR_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6200EE 27.7%, #A676EA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#6200EE",
  light: "#A676EA",
};

export const CONTEXT_PRESERVATION_LEVEL = {
  DIRECT: "Direct",
  CULTURAL_ADAPTATION: "Cultural Adaptation",
};

export const FORMALITY_LEVEL_ADJUSTMENT = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const OUTPUT_FORMAT = {
  PLAIN_TEXT: "Plain Text",
  FORMATTED_DOCUMENT: "Formatted Document",
};

export const SOURCE_LANGUAGE = {
  ENGLISH: "English",
  SPANISH: "Spanish",
  FRENCH: "French",
  GERMAN: "German",
  ITALIAN: "Italian",
  PORTUGUESE: "Portuguese",
  RUSSIAN: "Russian",
  JAPANESE: "Japanese",
  KOREAN: "Korean",
  CHINESE: "Chinese",
};

export default TINYGPT_TRANSLATOR_NODE;
