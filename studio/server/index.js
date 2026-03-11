import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors());
app.use(express.json());

let openai = null;
if (process.env.AI_INTEGRATIONS_OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
} else {
  console.warn("OpenAI API key not configured - AI features will be disabled");
}

const FORMULA_CAPABILITIES = `
AVAILABLE FUNCTIONS:
- ADD(a, b) - Adds two numbers
- SUBTRACT(a, b) - Subtracts b from a
- MULTIPLY(a, b) - Multiplies two numbers
- DIVIDE(a, b) - Divides a by b
- CONCAT(str1, str2, ...) - Concatenates strings
- IF(condition, trueValue, falseValue) - Conditional logic
- AND(a, b) - Logical AND
- OR(a, b) - Logical OR
- NOT(a) - Logical NOT
- EQUALS(a, b) - Checks equality
- GREATER_THAN(a, b) - Checks if a > b
- LESS_THAN(a, b) - Checks if a < b
- LENGTH(str) - Returns string length
- UPPER(str) - Converts to uppercase
- LOWER(str) - Converts to lowercase
- TRIM(str) - Removes whitespace
- ROUND(num, decimals) - Rounds a number
- ABS(num) - Absolute value
- MAX(a, b, ...) - Maximum value
- MIN(a, b, ...) - Minimum value
- SUM(a, b, ...) - Sum of values
- AVERAGE(a, b, ...) - Average of values
- NOW() - Current timestamp
- TODAY() - Current date
- DATE_ADD(date, days) - Adds days to date
- DATE_DIFF(date1, date2) - Difference between dates
- FORMAT_DATE(date, format) - Formats date
- COALESCE(a, b, ...) - Returns first non-null value
- CONTAINS(str, search) - Checks if string contains search
- REPLACE(str, find, replace) - Replaces text
- SPLIT(str, delimiter) - Splits string into array
- JOIN(array, delimiter) - Joins array into string
- INDEX(array, position) - Gets array element at position
- MAP(array, expression) - Transforms array elements
- FILTER(array, condition) - Filters array elements

SYNTAX RULES:
- Functions use parentheses: FUNCTION_NAME(arg1, arg2)
- Variables are referenced by name: {{variableName}}
- Nested functions: ADD(1, MULTIPLY(2, 3))
- String literals use quotes: "hello"
- Numbers are plain: 42, 3.14
- Boolean values: true, false
`;

const generateSystemPrompt = (variables, functions) => `
You are an expert formula builder assistant. Your job is to translate natural language requests into valid formulas.

${FORMULA_CAPABILITIES}

AVAILABLE VARIABLES IN CONTEXT:
${variables?.length > 0 ? variables.map(v => `- ${v.name} (type: ${v.type})`).join("\n") : "No variables available"}

${functions?.length > 0 ? `CUSTOM FUNCTIONS:\n${functions.join(", ")}` : ""}

RESPONSE FORMAT:
You must respond with valid JSON containing:
{
  "formula": "THE_FORMULA_HERE",
  "explanation": "Brief explanation of what the formula does",
  "confidence": 0.95
}

RULES:
1. Always use the exact function names provided
2. Reference variables using {{variableName}} syntax
3. Nest functions as needed for complex logic
4. If the request is ambiguous, make reasonable assumptions and note them in explanation
5. If you cannot create a valid formula, set formula to null and explain why
`;

app.post("/api/ai-formula-journey", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: "AI features not configured", success: false });
    }
    const { query, variables = [], functions = [] } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: generateSystemPrompt(variables, functions),
        },
        {
          role: "user",
          content: `Create a formula for: ${query}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    res.json({
      formula: result.formula,
      explanation: result.explanation,
      confidence: result.confidence || 0.8,
      success: !!result.formula,
    });
  } catch (error) {
    console.error("Error in /api/ai-formula-journey:", error);
    res.status(500).json({
      error: error.message || "Failed to generate formula",
      success: false,
    });
  }
});

app.post("/api/ai-formula-fix", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: "AI features not configured", success: false });
    }
    const { formula, error: formulaError, variables = [], functions = [] } = req.body;

    if (!formula) {
      return res.status(400).json({ error: "Formula is required" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${generateSystemPrompt(variables, functions)}

You are fixing a formula that has an error. Analyze the error and provide a corrected formula.

ADDITIONAL RESPONSE FIELDS:
{
  "formula": "CORRECTED_FORMULA",
  "explanation": "What was wrong and how you fixed it",
  "originalError": "Brief description of the original error",
  "confidence": 0.95
}`,
        },
        {
          role: "user",
          content: `Fix this formula:
Formula: ${formula}
Error: ${formulaError || "Unknown error - please analyze and fix any issues"}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    res.json({
      formula: result.formula,
      explanation: result.explanation,
      originalError: result.originalError,
      confidence: result.confidence || 0.8,
      success: !!result.formula,
    });
  } catch (error) {
    console.error("Error in /api/ai-formula-fix:", error);
    res.status(500).json({
      error: error.message || "Failed to fix formula",
      success: false,
    });
  }
});

app.post("/api/ai-formula-explain", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: "AI features not configured", success: false });
    }
    const { formula, variables = [] } = req.body;

    if (!formula) {
      return res.status(400).json({ error: "Formula is required" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a formula explanation assistant. Explain formulas in plain English that non-technical users can understand. Always respond in JSON format.

${FORMULA_CAPABILITIES}

AVAILABLE VARIABLES:
${variables?.length > 0 ? variables.map(v => `- ${v.name} (type: ${v.type})`).join("\n") : "No variables available"}

JSON RESPONSE FORMAT:
{
  "summary": "One sentence summary of what the formula does",
  "stepByStep": ["Step 1: ...", "Step 2: ..."],
  "inputs": ["List of inputs/variables used"],
  "output": "Description of what the formula returns"
}`,
        },
        {
          role: "user",
          content: `Explain this formula: ${formula}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    res.json({
      ...result,
      success: true,
    });
  } catch (error) {
    console.error("Error in /api/ai-formula-explain:", error);
    res.status(500).json({
      error: error.message || "Failed to explain formula",
      success: false,
    });
  }
});

app.post("/api/ai-formula-optimize", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: "AI features not configured", success: false });
    }
    const { formula, variables = [], functions = [] } = req.body;

    if (!formula) {
      return res.status(400).json({ error: "Formula is required" });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `${generateSystemPrompt(variables, functions)}

You are optimizing formulas for better performance and readability.

RESPONSE FORMAT:
{
  "optimizedFormula": "OPTIMIZED_FORMULA or null if no optimization needed",
  "suggestions": ["List of improvement suggestions"],
  "reasoning": "Why these changes improve the formula",
  "isOptimal": true/false
}`,
        },
        {
          role: "user",
          content: `Optimize this formula if possible: ${formula}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from AI");
    }

    const result = JSON.parse(content);
    res.json({
      ...result,
      success: true,
    });
  } catch (error) {
    console.error("Error in /api/ai-formula-optimize:", error);
    res.status(500).json({
      error: error.message || "Failed to optimize formula",
      success: false,
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AI Formula server running on port ${PORT}`);
});
