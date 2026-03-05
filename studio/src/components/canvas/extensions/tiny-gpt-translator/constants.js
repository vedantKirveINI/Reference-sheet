import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { TINY_GPT_TRANSLATOR_TYPE } from "../constants/types";
import extensionIcons from "../../assets/extensions";

export { TINY_GPT_TRANSLATOR_TYPE };

export const TINYGPT_TRANSLATOR_V2_NODE = {
  cmsId: "tiny-gpt-translator-v2",
  _src: extensionIcons.tinyGptTranslator,
  name: "Tiny GPT Translator",
  description: "Translate text between languages",
  type: TINY_GPT_TRANSLATOR_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#0EA5E9",
  foreground: "#fff",
  dark: "#0284C7",
  light: "#38BDF8",
  hasTestModule: true,
  canSkipTest: false,
  credits: 15,
  meta: {
    search_keys: ["Translator", "Language", "Translate", "Localization", "AI Translation"],
  },
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: TINYGPT_TRANSLATOR_V2_NODE.dark,
  activeTabBg: TINYGPT_TRANSLATOR_V2_NODE.dark,
  activeTabText: "#ffffff",
};

export const TONE_OPTIONS = [
  { id: "formal", label: "Formal", description: "Professional and business-appropriate" },
  { id: "casual", label: "Casual", description: "Relaxed and conversational" },
  { id: "neutral", label: "Neutral", description: "Balanced and straightforward" },
  { id: "friendly", label: "Friendly", description: "Warm and approachable" },
];

export const LANGUAGE_OPTIONS = [
  { id: "auto", label: "Auto-detect", description: "Automatically detect source language" },
  { id: "en", label: "English", description: "" },
  { id: "es", label: "Spanish", description: "" },
  { id: "fr", label: "French", description: "" },
  { id: "de", label: "German", description: "" },
  { id: "it", label: "Italian", description: "" },
  { id: "pt", label: "Portuguese", description: "" },
  { id: "ru", label: "Russian", description: "" },
  { id: "ja", label: "Japanese", description: "" },
  { id: "ko", label: "Korean", description: "" },
  { id: "zh", label: "Chinese", description: "" },
  { id: "ar", label: "Arabic", description: "" },
  { id: "hi", label: "Hindi", description: "" },
  { id: "nl", label: "Dutch", description: "" },
  { id: "pl", label: "Polish", description: "" },
  { id: "tr", label: "Turkish", description: "" },
];

export const TARGET_LANGUAGE_OPTIONS = LANGUAGE_OPTIONS.filter(l => l.id !== "auto");
