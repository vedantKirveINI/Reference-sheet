import { FileText, Mail, Linkedin, ShoppingBag, Newspaper } from "lucide-react";

export const WRITER_TEMPLATE_PRESETS = [
  {
    id: "blog-post",
    name: "Blog Post",
    description: "Create engaging blog articles with proper structure and SEO-friendly formatting.",
    icon: FileText,
    iconBg: "#4299E1",
    defaults: {
      tone: "conversational",
      length: "long",
      audience: "General readers interested in the topic",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are an experienced blog writer who creates engaging, well-structured articles. You write with clarity, use subheadings effectively, and include actionable takeaways.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Write a comprehensive blog post about the following topic. Include an engaging introduction, clear sections with subheadings, and a conclusion with key takeaways:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "title", type: "string", description: "Blog post title" },
      { key: "content", type: "string", description: "Full blog post content" },
      { key: "meta_description", type: "string", description: "SEO meta description (150 chars)" },
    ],
  },
  {
    id: "email",
    name: "Email",
    description: "Compose professional or marketing emails with clear calls-to-action.",
    icon: Mail,
    iconBg: "#38B2AC",
    defaults: {
      tone: "professional",
      length: "short",
      audience: "Business professionals or customers",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are an email copywriting expert who writes clear, concise, and effective emails. You understand the importance of subject lines, opening hooks, and clear CTAs.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Write a professional email for the following purpose. Include a compelling subject line, clear body, and appropriate closing:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "subject_line", type: "string", description: "Email subject line" },
      { key: "body", type: "string", description: "Email body content" },
    ],
  },
  {
    id: "linkedin-post",
    name: "LinkedIn Post",
    description: "Create thought leadership content optimized for LinkedIn engagement.",
    icon: Linkedin,
    iconBg: "#0077B5",
    defaults: {
      tone: "professional",
      length: "medium",
      audience: "Professional network and industry peers",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a LinkedIn content strategist who creates engaging thought leadership posts. You use hooks, storytelling, and clear formatting to maximize engagement.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Write a LinkedIn post about the following topic. Start with a hook, share insights or a story, and end with a question or call-to-action:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "post", type: "string", description: "LinkedIn post content" },
      { key: "hashtags", type: "string", description: "Relevant hashtags (3-5)" },
    ],
  },
  {
    id: "product-description",
    name: "Product Description",
    description: "Write compelling product copy that highlights benefits and drives conversions.",
    icon: ShoppingBag,
    iconBg: "#ED8936",
    defaults: {
      tone: "persuasive",
      length: "short",
      audience: "Potential customers",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a product copywriter who transforms features into benefits. You write persuasive descriptions that address customer pain points and drive purchasing decisions.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Write a compelling product description for the following. Highlight key benefits, address customer needs, and include a clear value proposition:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "headline", type: "string", description: "Product headline" },
      { key: "description", type: "string", description: "Product description" },
      { key: "key_benefits", type: "string", description: "3-5 bullet point benefits" },
    ],
  },
  {
    id: "press-release",
    name: "Press Release",
    description: "Draft professional press releases following AP style guidelines.",
    icon: Newspaper,
    iconBg: "#718096",
    defaults: {
      tone: "professional",
      length: "medium",
      audience: "Journalists and media outlets",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a PR professional who writes press releases following AP style. You create newsworthy angles, include quotes, and structure content for maximum media pickup.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Write a press release for the following announcement. Include a compelling headline, dateline, lead paragraph, body with quotes, and boilerplate:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "headline", type: "string", description: "Press release headline" },
      { key: "subheadline", type: "string", description: "Supporting subheadline" },
      { key: "body", type: "string", description: "Full press release content" },
    ],
  },
];

export const getWriterTemplateById = (id) => {
  return WRITER_TEMPLATE_PRESETS.find((t) => t.id === id) || null;
};
