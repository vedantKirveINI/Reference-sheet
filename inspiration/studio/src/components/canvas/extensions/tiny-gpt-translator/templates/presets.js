import { Briefcase, MessageCircle, FileCode, Megaphone } from "lucide-react";

export const TRANSLATOR_TEMPLATE_PRESETS = [
  {
    id: "formal",
    name: "Formal Translation",
    description: "Professional and business-appropriate translations for official documents.",
    icon: Briefcase,
    iconBg: "#0EA5E9",
    defaults: {
      tone: "formal",
      sourceLanguage: "auto",
      targetLanguage: "en",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a professional translator specializing in formal and business communications. Maintain precise terminology, proper honorifics, and professional tone throughout the translation.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Translate the following text with a formal, professional tone. Preserve the original meaning while ensuring the translation is appropriate for business or official contexts:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "translated_text", type: "string", description: "The translated text" },
      { key: "detected_language", type: "string", description: "Source language detected" },
    ],
  },
  {
    id: "casual",
    name: "Casual Translation",
    description: "Relaxed and conversational translations for everyday communication.",
    icon: MessageCircle,
    iconBg: "#10B981",
    defaults: {
      tone: "casual",
      sourceLanguage: "auto",
      targetLanguage: "en",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a translator who specializes in casual, everyday language. Use natural expressions, colloquialisms, and a friendly tone that feels authentic to native speakers.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Translate the following text in a casual, conversational style. Keep it natural and use common expressions where appropriate:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "translated_text", type: "string", description: "The translated text" },
      { key: "detected_language", type: "string", description: "Source language detected" },
    ],
  },
  {
    id: "technical",
    name: "Technical Translation",
    description: "Accurate translations for technical documentation and specifications.",
    icon: FileCode,
    iconBg: "#8B5CF6",
    defaults: {
      tone: "neutral",
      sourceLanguage: "auto",
      targetLanguage: "en",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a technical translator with expertise in software, engineering, and scientific documentation. Maintain technical accuracy, preserve terminology, and ensure clarity for technical readers.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Translate the following technical content accurately. Preserve technical terms, maintain consistency in terminology, and ensure the translation is clear for technical audiences:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "translated_text", type: "string", description: "The translated text" },
      { key: "detected_language", type: "string", description: "Source language detected" },
      { key: "terminology_notes", type: "string", description: "Notes on technical terms used" },
    ],
  },
  {
    id: "marketing",
    name: "Marketing Translation",
    description: "Creative translations that preserve brand voice and marketing impact.",
    icon: Megaphone,
    iconBg: "#F59E0B",
    defaults: {
      tone: "friendly",
      sourceLanguage: "auto",
      targetLanguage: "en",
    },
    role: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "You are a marketing translator who transcreates content to maintain its emotional impact and persuasive power. Adapt cultural references, idioms, and marketing messages to resonate with the target audience.",
        },
      ],
    },
    task: {
      type: "fx",
      blocks: [
        {
          type: "text",
          value: "Translate and adapt the following marketing content. Maintain the persuasive impact, adapt cultural references, and ensure the message resonates with the target audience:\n\n",
        },
      ],
    },
    outputSchema: [
      { key: "translated_text", type: "string", description: "The translated/transcreated text" },
      { key: "detected_language", type: "string", description: "Source language detected" },
      { key: "adaptation_notes", type: "string", description: "Notes on cultural adaptations made" },
    ],
  },
];

export const getTranslatorTemplateById = (id) => {
  return TRANSLATOR_TEMPLATE_PRESETS.find((t) => t.id === id) || null;
};
