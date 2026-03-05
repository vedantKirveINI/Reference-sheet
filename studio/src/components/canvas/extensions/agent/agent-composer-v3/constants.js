import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import extensionIcons from "../../../assets/extensions";
import { AGENT_TINY_COMPOSER } from "../../constants/types";

/** @deprecated Use AGENT_TINY_COMPOSER for stored type; kept for metadata/backward refs. */
export const AGENT_COMPOSER_V3_TYPE = "AGENT_COMPOSER_V3";

export const AGENT_COMPOSER_V3_NODE = {
  cmsId: "agent-composer-v3",
  _src: extensionIcons.tinyGPTWriter,
  name: "Tiny Composer",
  type: AGENT_TINY_COMPOSER,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
  foreground: "#fff",
  dark: "#6D28D9",
  light: "#8B5CF6",
  hasTestModule: true,
  canSkipTest: true,
  credits: 10,
  meta: {
    search_keys: ["Composer", "Email", "Message", "Outreach", "Notification", "Personalize"],
  },
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: AGENT_COMPOSER_V3_NODE.dark,
  activeTabBg: AGENT_COMPOSER_V3_NODE.dark,
  activeTabText: "#ffffff",
};

export const COMPOSER_TEMPLATES = [
  {
    id: "email-template",
    label: "Email Template",
    description: "Compose professional email messages",
    icon: "Mail",
    iconBg: "#8B5CF6",
  },
  {
    id: "outreach-message",
    label: "Outreach Message",
    description: "Sales and marketing outreach",
    icon: "Megaphone",
    iconBg: "#F59E0B",
  },
  {
    id: "notification",
    label: "Notification",
    description: "System alerts and notifications",
    icon: "Bell",
    iconBg: "#10B981",
  },
  {
    id: "personalized-message",
    label: "Personalized Message",
    description: "Dynamic personalized content",
    icon: "UserCheck",
    iconBg: "#3B82F6",
  },
];

export const TONE_OPTIONS = [
  { id: "professional", label: "Professional", description: "Formal business tone" },
  { id: "friendly", label: "Friendly", description: "Warm and approachable" },
  { id: "casual", label: "Casual", description: "Relaxed and informal" },
  { id: "persuasive", label: "Persuasive", description: "Compelling and action-oriented" },
];

export const OUTPUT_SCHEMA = [
  { key: "subject", type: "string", description: "Generated email/message subject" },
  { key: "body", type: "string", description: "Generated email/message body" },
  { key: "formatted_message", type: "string", description: "Full formatted message" },
];

export const getComposerTemplateById = (id) => {
  return COMPOSER_TEMPLATES.find((t) => t.id === id) || null;
};
