import extensionIcons from "../../assets/extensions";

export const GPT_CREATIVE_NODE = {
  cmsId: "gpt-creative",
  _src: extensionIcons.tinyGptCreative,
  name: "GPT Creative",
  description: "Generate creative content and copy",
  type: "GPT_CREATIVE",
  background: "#DB2777",
  dark: "#BE185D",
  light: "#DB2777",
  hasTestModule: true,
  canSkipTest: false,
  credits: 10,
  meta: {
    search_keys: ["Creative", "Marketing", "Copy", "Social Media", "Content", "Email", "Product"],
  },
};

export const CREATIVE_TEMPLATES = [
  {
    id: "marketing-copy",
    name: "Marketing Copy",
    description: "Create compelling marketing and advertising content",
    icon: "Megaphone",
    iconBg: "#F59E0B",
    defaults: {
      prompt: "Write compelling marketing copy for:\n\n{{input}}",
      systemPrompt: "You are a creative copywriter. Write persuasive, engaging marketing content.",
      outputSchema: [
        { id: "field-content", key: "content", type: "string", required: true },
      ],
    },
  },
  {
    id: "social-media",
    name: "Social Media Posts",
    description: "Generate engaging posts for social platforms",
    icon: "Share2",
    iconBg: "#3B82F6",
    defaults: {
      prompt: "Create engaging social media posts for:\n\n{{input}}",
      systemPrompt: "You are a social media expert. Create engaging, shareable content optimized for each platform.",
      outputSchema: [
        { id: "field-post", key: "post", type: "string", required: true },
        { id: "field-hashtags", key: "hashtags", type: "array", required: false },
      ],
    },
  },
  {
    id: "product-descriptions",
    name: "Product Descriptions",
    description: "Write compelling product descriptions for e-commerce",
    icon: "ShoppingBag",
    iconBg: "#10B981",
    defaults: {
      prompt: "Write a compelling product description for:\n\n{{input}}",
      systemPrompt: "You are an e-commerce copywriter. Write persuasive product descriptions that drive conversions.",
      outputSchema: [
        { id: "field-description", key: "description", type: "string", required: true },
        { id: "field-features", key: "features", type: "array", required: false },
      ],
    },
  },
  {
    id: "email-campaigns",
    name: "Email Campaigns",
    description: "Create effective email marketing content",
    icon: "Mail",
    iconBg: "#8B5CF6",
    defaults: {
      prompt: "Write an email campaign for:\n\n{{input}}",
      systemPrompt: "You are an email marketing specialist. Write engaging emails with clear calls to action.",
      outputSchema: [
        { id: "field-subject", key: "subject", type: "string", required: true },
        { id: "field-body", key: "body", type: "string", required: true },
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
  primaryButtonBg: GPT_CREATIVE_NODE.dark,
  activeTabBg: GPT_CREATIVE_NODE.dark,
  activeTabText: "#ffffff",
};

export const getTemplateById = (id) =>
  CREATIVE_TEMPLATES.find((t) => t.id === id);
