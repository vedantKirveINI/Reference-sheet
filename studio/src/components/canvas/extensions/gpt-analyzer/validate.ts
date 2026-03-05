interface OutputSchemaField {
  id?: string;
  key: string;
  type: string;
  required?: boolean;
}

interface GPTAnalyzerData {
  name?: string;
  persona?: { blocks: unknown[] } | null;
  query?: { blocks: unknown[] } | null;
  format?: { schema: OutputSchemaField[] }[];
  outputFormat?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateGPTAnalyzer = (data: GPTAnalyzerData): ValidationResult => {
  const errors: Record<string, string> = {};

  const hasSystemPrompt = data.persona?.blocks && data.persona.blocks.length > 0;
  const hasPrompt = data.query?.blocks && data.query.blocks.length > 0;
  const outputSchema = (Array.isArray(data.format) && data.format.length > 0 && data.format[0]?.key) ? data.format : (data.format?.[0]?.schema || []);
  const hasOutput = outputSchema.length > 0 && outputSchema.some((field) => field.key?.trim());

  if (!hasSystemPrompt) {
    errors.systemPrompt = "Define a system prompt or persona";
  }

  if (!hasPrompt) {
    errors.prompt = "Provide an analysis prompt";
  }

  if (!hasOutput) {
    errors.output = "Define at least one output field";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateOutputSchema = (schema: OutputSchemaField[]): boolean => {
  if (!Array.isArray(schema) || schema.length === 0) {
    return false;
  }

  return schema.every((field) => {
    if (!field.key || typeof field.key !== "string" || !field.key.trim()) {
      return false;
    }
    if (!field.type || typeof field.type !== "string") {
      return false;
    }
    return true;
  });
};

export const normalizeOutputSchema = (schema: OutputSchemaField[]): OutputSchemaField[] => {
  if (!Array.isArray(schema)) {
    return [{ id: "field-default", key: "analysis", type: "string", required: true }];
  }

  return schema.map((field, index) => ({
    id: field.id || `field-${Date.now()}-${index}`,
    key: field.key || "",
    type: field.type || "string",
    required: field.required !== false,
  }));
};

export default validateGPTAnalyzer;
