/**
 * @deprecated Use AGENT_COMPOSER_V3_NODE from agent-composer-v3/constants.js instead.
 * This component is deprecated and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based AgentComposerV3.
 */
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";

export const AGENT_COMPOSER_V2_TYPE = "AGENT_COMPOSER_V2";

export const AGENT_COMPOSER_V2_NODE = {
  cmsId: "agent-composer-v2",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1741763088435/TinyComposer.svg",
  name: "Tiny Composer V2 (Deprecated)",
  type: AGENT_COMPOSER_V2_TYPE,
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

export const COMPOSER_TEMPLATES = [
  {
    id: "email-template",
    label: "Email Template",
    description: "Compose email messages",
    icon: "Mail",
    iconBg: "#8B5CF6",
  },
  {
    id: "outreach-message",
    label: "Outreach Message",
    description: "Sales/marketing outreach",
    icon: "Megaphone",
    iconBg: "#F59E0B",
  },
  {
    id: "notification",
    label: "Notification",
    description: "System notifications",
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
  return COMPOSER_TEMPLATES.find((t) => t.id === id);
};
