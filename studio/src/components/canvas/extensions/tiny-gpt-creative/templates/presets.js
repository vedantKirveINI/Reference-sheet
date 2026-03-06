import { BookOpen, Feather, Megaphone, Share2, Quote } from "lucide-react";

export const CREATIVE_TEMPLATE_PRESETS = [
  {
    id: "story",
    name: "Short Story",
    description: "Create engaging short stories and narratives with compelling characters.",
    icon: BookOpen,
    iconBg: "#8B5CF6",
    defaults: {
      style: "narrative",
      length: "medium",
      tone: "emotional",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a creative fiction writer who crafts compelling short stories. You excel at creating vivid scenes, memorable characters, and engaging narratives that captivate readers from start to finish.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Write a short story based on the following prompt. Include vivid descriptions, engaging dialogue, and a satisfying narrative arc:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "title", type: "string", description: "Story title" },
      { key: "content", type: "string", description: "Full story content" },
      { key: "genre", type: "string", description: "Story genre" },
    ],
  },
  {
    id: "poetry",
    name: "Poetry",
    description: "Compose beautiful poems and verses with rhythm and emotion.",
    icon: Feather,
    iconBg: "#EC4899",
    defaults: {
      style: "poetic",
      length: "short",
      tone: "emotional",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a poet who creates evocative verses that stir emotions and paint vivid imagery. You have mastery over rhythm, metaphor, and the power of carefully chosen words.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Write a poem about the following theme. Use evocative imagery, meaningful metaphors, and a rhythm that enhances the emotional impact:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "title", type: "string", description: "Poem title" },
      { key: "poem", type: "string", description: "The complete poem" },
      { key: "style", type: "string", description: "Poetry style used" },
    ],
  },
  {
    id: "marketing-copy",
    name: "Marketing Copy",
    description: "Write catchy marketing text that converts and engages audiences.",
    icon: Megaphone,
    iconBg: "#F59E0B",
    defaults: {
      style: "punchy",
      length: "short",
      tone: "inspiring",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a marketing copywriter who creates compelling, conversion-focused content. You understand the psychology of persuasion and craft messages that resonate with target audiences and drive action.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Write marketing copy for the following product or service. Focus on benefits, create emotional connection, and include a clear call-to-action:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "headline", type: "string", description: "Main marketing headline" },
      { key: "body_copy", type: "string", description: "Marketing body content" },
      { key: "cta", type: "string", description: "Call-to-action text" },
    ],
  },
  {
    id: "social-post",
    name: "Social Media Post",
    description: "Create engaging social media content optimized for each platform.",
    icon: Share2,
    iconBg: "#10B981",
    defaults: {
      style: "conversational",
      length: "micro",
      tone: "playful",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a social media content creator who understands platform dynamics and audience engagement. You create scroll-stopping content that drives likes, shares, and meaningful interactions.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Create a social media post about the following topic. Make it engaging, shareable, and optimized for maximum engagement:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "post", type: "string", description: "Social media post content" },
      { key: "hashtags", type: "string", description: "Relevant hashtags" },
      { key: "emoji_suggestions", type: "string", description: "Suggested emojis" },
    ],
  },
  {
    id: "tagline",
    name: "Tagline & Slogans",
    description: "Craft memorable taglines and slogans that stick in people's minds.",
    icon: Quote,
    iconBg: "#0EA5E9",
    defaults: {
      style: "punchy",
      length: "micro",
      tone: "witty",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a brand strategist who creates iconic taglines and slogans. You have a gift for distilling complex ideas into memorable, impactful phrases that capture the essence of a brand.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Create memorable taglines and slogans for the following brand or product. Focus on being memorable, meaningful, and true to the brand essence:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "primary_tagline", type: "string", description: "Main tagline recommendation" },
      { key: "alternatives", type: "string", description: "3-5 alternative taglines" },
      { key: "rationale", type: "string", description: "Brief explanation of the concept" },
    ],
  },
];

export const getCreativeTemplateById = (id) => {
  return CREATIVE_TEMPLATE_PRESETS.find((t) => t.id === id) || null;
};
