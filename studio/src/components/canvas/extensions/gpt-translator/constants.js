import extensionIcons from "../../assets/extensions";

export const GPT_TRANSLATOR_NODE = {
  cmsId: "gpt-translator",
  _src: extensionIcons.tinyGptTranslator,
  name: "GPT Translator",
  description: "Translate content between languages",
  type: "GPT_TRANSLATOR",
  background: "#0284C7",
  dark: "#0369A1",
  light: "#0284C7",
  hasTestModule: true,
  canSkipTest: false,
  credits: 10,
  meta: {
    search_keys: ["Translate", "Language", "Localize", "Spanish", "French", "German", "Chinese", "Multi-language"],
  },
};

export const TRANSLATOR_TEMPLATES = [
  {
    id: "translate-spanish",
    name: "Translate to Spanish",
    description: "Convert English content to Spanish",
    icon: "Globe",
    iconBg: "#EF4444",
    defaults: {
      prompt: "Translate the following text to Spanish:\n\n{{input}}",
      systemPrompt: "You are a professional Spanish translator. Maintain the original tone and meaning.",
      outputSchema: [
        { id: "field-translation", key: "translation", type: "string", required: true },
      ],
    },
  },
  {
    id: "translate-french",
    name: "Translate to French",
    description: "Convert content to French",
    icon: "Globe",
    iconBg: "#3B82F6",
    defaults: {
      prompt: "Translate the following text to French:\n\n{{input}}",
      systemPrompt: "You are a professional French translator. Maintain the original tone and meaning.",
      outputSchema: [
        { id: "field-translation", key: "translation", type: "string", required: true },
      ],
    },
  },
  {
    id: "translate-german",
    name: "Translate to German",
    description: "Convert content to German",
    icon: "Globe",
    iconBg: "#FBBF24",
    defaults: {
      prompt: "Translate the following text to German:\n\n{{input}}",
      systemPrompt: "You are a professional German translator. Maintain the original tone and meaning.",
      outputSchema: [
        { id: "field-translation", key: "translation", type: "string", required: true },
      ],
    },
  },
  {
    id: "translate-chinese",
    name: "Translate to Chinese",
    description: "Convert content to Simplified Chinese",
    icon: "Globe",
    iconBg: "#DC2626",
    defaults: {
      prompt: "Translate the following text to Simplified Chinese:\n\n{{input}}",
      systemPrompt: "You are a professional Chinese translator. Maintain the original tone and meaning.",
      outputSchema: [
        { id: "field-translation", key: "translation", type: "string", required: true },
      ],
    },
  },
  {
    id: "multi-language",
    name: "Multi-Language",
    description: "Translate to multiple languages at once",
    icon: "Languages",
    iconBg: "#8B5CF6",
    defaults: {
      prompt: "Translate the following text to Spanish, French, and German:\n\n{{input}}",
      systemPrompt: "You are a multilingual translator. Provide accurate translations in all requested languages.",
      outputSchema: [
        { id: "field-spanish", key: "spanish", type: "string", required: true },
        { id: "field-french", key: "french", type: "string", required: true },
        { id: "field-german", key: "german", type: "string", required: true },
      ],
    },
  },
];

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: GPT_TRANSLATOR_NODE.dark,
  activeTabBg: GPT_TRANSLATOR_NODE.dark,
  activeTabText: "#ffffff",
};

export const getTemplateById = (id) =>
  TRANSLATOR_TEMPLATES.find((t) => t.id === id);
