/**
 * TinyGPTHandler - Handles /api/canvas-assistant/tinygpt-test endpoint
 * 
 * Proxy endpoint for TinyGPT testing functionality
 */
export class TinyGPTHandler {
  constructor() {
    this.TINYGPT_API_URL = "https://gptbff.gofo.app/chatgpt";
    this.TINYGPT_AUTH_TOKEN =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiTVdfVE9LRU4iLCJpYXQiOjE3MTM0MzQxMzYsImV4cCI6MzMyMzk0NzY1MzZ9.WkteIQd5UM-IABV-JiTCjftVhunt4dG4_KjoDI8ES-k";
  }

  extractBlocksText(fxData, stateValues = {}) {
    if (!fxData) return "";
    if (typeof fxData === "string") return fxData;
    const blocks = fxData.blocks || [];
    if (blocks.length === 0) return "";
    return blocks
      .map((block) => {
        if (block.type === "PRIMITIVES") {
          return block.value || "";
        }
        if (block.type === "VARIABLE" || block.type === "REF") {
          const varKey = block.value || block.key || "";
          if (stateValues[varKey] !== undefined) {
            return String(stateValues[varKey]);
          }
          return `{{${varKey}}}`;
        }
        return block.value || "";
      })
      .join("");
  }

  buildOutputFormat(format, originalOutputFormat) {
    if (originalOutputFormat === "text" || !format || format.length === 0) {
      return { response: "string" };
    }
    const outputFormat = {};
    const fields = Array.isArray(format) ? format : [];
    fields.forEach((field) => {
      const key = field.key || field.label || "";
      if (!key.trim()) return;
      const rawType = (field.type || "string").toLowerCase();
      const typeMap = {
        string: "string",
        number: "number",
        int: "number",
        boolean: "boolean",
        object: "object",
        array: "array",
      };
      outputFormat[key] = typeMap[rawType] || "string";
    });
    if (Object.keys(outputFormat).length === 0) {
      return { response: "string" };
    }
    return outputFormat;
  }

  async handle(req, res) {
    try {
      const { goData, stateValues = {} } = req.body || {};
      if (!goData) {
        return res.status(400).json({ error: "goData is required" });
      }

      const persona = this.extractBlocksText(goData.persona || goData.systemPrompt, stateValues);
      const query = this.extractBlocksText(goData.query || goData.prompt, stateValues);
      const originalOutputFormat =
        goData._originalOutputFormat ||
        (typeof goData.outputFormat === "string" ? goData.outputFormat : "json");
      const formatArray = goData.format || goData.outputSchema || [];
      const outputFormat = this.buildOutputFormat(formatArray, originalOutputFormat);

      const apiPayload = { persona, query, outputFormat };

      const apiResponse = await fetch(this.TINYGPT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.TINYGPT_AUTH_TOKEN}`,
        },
        body: JSON.stringify(apiPayload),
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text().catch(() => "Unknown error");
        return res.status(apiResponse.status).json({
          error: true,
          message: `TinyGPT API error (${apiResponse.status}): ${errorText}`,
        });
      }

      const result = await apiResponse.json();
      return res.json(result);
    } catch (error) {
      console.error("[TinyGPTHandler] Error:", error.message);
      return res.status(500).json({
        error: true,
        message: error.message || "Failed to execute TinyGPT test",
      });
    }
  }
}
