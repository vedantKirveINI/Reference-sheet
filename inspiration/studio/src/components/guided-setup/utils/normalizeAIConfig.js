const GPT_TYPES = new Set([
  "GPT",
  "GPT_RESEARCHER",
  "GPT_WRITER",
  "GPT_ANALYZER",
  "GPT_SUMMARIZER",
  "GPT_TRANSLATOR",
  "GPT_CREATIVE",
  "GPT_LEARNING",
  "GPT_CONSULTANT",
]);

const DEFAULT_PERSONAS = {
  GPT: "You are a helpful AI assistant.",
  GPT_RESEARCHER: "You are a thorough researcher who finds and synthesizes information.",
  GPT_WRITER: "You are a professional writer who produces clear, well-structured content.",
  GPT_ANALYZER: "You are a data analyst who provides thorough, structured analysis.",
  GPT_SUMMARIZER: "You are a skilled summarizer who creates concise, informative summaries.",
  GPT_TRANSLATOR: "You are a professional translator who produces accurate translations.",
  GPT_CREATIVE: "You are a creative writer who generates imaginative, engaging content.",
  GPT_LEARNING: "You are a knowledgeable teacher who explains concepts clearly.",
  GPT_CONSULTANT: "You are an expert consultant who provides actionable advice.",
};

function isAlreadyFxBlocks(val) {
  return val && typeof val === "object" && val.type === "fx" && Array.isArray(val.blocks);
}

function toFxBlocks(str) {
  if (!str || typeof str !== "string") return null;
  const trimmed = str.trim();
  if (!trimmed) return null;
  return {
    type: "fx",
    blocks: [{ type: "PRIMITIVES", value: trimmed }],
  };
}

function toFxBlocksWithVariables(str) {
  if (!str || typeof str !== "string") return null;
  const trimmed = str.trim();
  if (!trimmed) return null;

  const varPattern = /\{\{[^}]+\}\}/g;
  const parts = trimmed.split(varPattern).filter((p) => p !== undefined);
  const matches = trimmed.match(varPattern) || [];

  const blocks = [];
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]) {
      blocks.push({ type: "PRIMITIVES", value: parts[i] });
    }
    if (i < matches.length) {
      blocks.push({ type: "PROPERTY", value: matches[i] });
    }
  }

  if (blocks.length === 0) return null;
  return { type: "fx", blocks };
}

function smartFxConvert(val) {
  if (isAlreadyFxBlocks(val)) return val;
  if (!val || typeof val !== "string") return null;
  if (val.includes("{{")) {
    return toFxBlocksWithVariables(val);
  }
  return toFxBlocks(val);
}

let rowIdCounter = 0;
function generateRowId() {
  rowIdCounter += 1;
  return `ai-row-${Date.now()}-${rowIdCounter}`;
}

function normalizeGPT(config, nodeType) {
  const result = { _isFromScratch: true };

  const promptSrc = config.query || config.prompt;
  const personaSrc = config.persona || config.systemPrompt;

  if (promptSrc) {
    result.query = smartFxConvert(promptSrc);
  }

  if (personaSrc) {
    result.persona = smartFxConvert(personaSrc);
  } else {
    const defaultPersona = DEFAULT_PERSONAS[nodeType] || DEFAULT_PERSONAS.GPT;
    result.persona = toFxBlocks(defaultPersona);
  }

  if (config.outputSchema) result.outputSchema = config.outputSchema;
  if (config.format) result.format = config.format;
  if (config.outputFormat) result.outputFormat = config.outputFormat;
  if (config.temperature != null) result.temperature = config.temperature;
  if (config.maxTokens != null) result.maxTokens = config.maxTokens;
  if (config.targetLanguage) result.targetLanguage = config.targetLanguage;

  return result;
}

function normalizeHTTP(config) {
  const result = { _isFromScratch: true };

  if (config.url) {
    result.url = smartFxConvert(config.url);
  }

  if (config.method) {
    result.method = config.method.toUpperCase();
  }

  if (config.headers && typeof config.headers === "object" && !Array.isArray(config.headers)) {
    result.headers = Object.entries(config.headers).map(([key, val]) => ({
      key,
      value: smartFxConvert(String(val)) || toFxBlocks(String(val)),
      valueStr: String(val),
      rowid: generateRowId(),
    }));
  }

  if (config.body) {
    if (typeof config.body === "string") {
      result.body = {
        type: "raw",
        sub_type: "json",
        data: smartFxConvert(config.body),
      };
    } else if (typeof config.body === "object") {
      const bodyStr = JSON.stringify(config.body, null, 2);
      result.body = {
        type: "raw",
        sub_type: "json",
        data: toFxBlocks(bodyStr),
        jsonInputMode: "raw",
        jsonFxData: toFxBlocks(bodyStr),
      };
    }
  }

  if (config.authorization) {
    result.authorization = config.authorization;
  }

  if (config.query_params && typeof config.query_params === "object") {
    result.query_params = Object.entries(config.query_params).map(([key, val]) => ({
      key,
      value: smartFxConvert(String(val)) || toFxBlocks(String(val)),
      valueStr: String(val),
      rowid: generateRowId(),
    }));
  }

  return result;
}

function normalizeTransformer(config) {
  const result = { _isFromScratch: true };

  if (config.expression) {
    const blocks = [];
    const expr = config.expression;
    if (expr.includes("{{")) {
      const varPattern = /\{\{[^}]+\}\}/g;
      const parts = expr.split(varPattern);
      const matches = expr.match(varPattern) || [];
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) blocks.push({ type: "PRIMITIVES", value: parts[i] });
        if (i < matches.length) blocks.push({ type: "PROPERTY", value: matches[i] });
      }
    } else {
      blocks.push({ type: "PRIMITIVES", value: expr });
    }
    result.content = { type: "fx", blocks };
  }

  if (config.outputKey) result.outputKey = config.outputKey;

  return result;
}

function normalizeSelfEmail(config) {
  const result = { _isFromScratch: true };

  if (config.subject) {
    result.subject = smartFxConvert(config.subject);
  }
  if (config.body) {
    result.body = smartFxConvert(config.body);
  }
  if (config.to) {
    result.to = smartFxConvert(config.to);
  }

  return result;
}

function normalizeDelay(config) {
  const result = { _isFromScratch: true };
  if (config.delaySeconds != null) result.delaySeconds = config.delaySeconds;
  if (config.delayMinutes != null) result.delayMinutes = config.delayMinutes;
  if (config.delayHours != null) result.delayHours = config.delayHours;
  return result;
}

export function normalizeAIConfigForGoData(backendType, aiConfig) {
  if (!aiConfig || typeof aiConfig !== "object" || Object.keys(aiConfig).length === 0) {
    return null;
  }

  if (GPT_TYPES.has(backendType)) {
    return normalizeGPT(aiConfig, backendType);
  }

  if (backendType === "HTTP") {
    return normalizeHTTP(aiConfig);
  }

  if (backendType === "TRANSFORMER_V3" || backendType === "FORMULA_FX") {
    return normalizeTransformer(aiConfig);
  }

  if (backendType === "SELF_EMAIL") {
    return normalizeSelfEmail(aiConfig);
  }

  if (backendType === "DELAY_V2") {
    return normalizeDelay(aiConfig);
  }

  if (backendType === "Integration" || backendType?.startsWith?.("external/")) {
    return null;
  }

  return { ...aiConfig };
}

export { toFxBlocks, toFxBlocksWithVariables, smartFxConvert, isAlreadyFxBlocks };
