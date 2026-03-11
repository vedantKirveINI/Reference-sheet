export const ACTION_PLAN_VERSION = "v1";

/**
 * ActionPlan (v1)
 *
 * This is the single contract between the planner (LLM) and the client executor.
 * It is canvas-agnostic and must remain backward compatible once released.
 */
export const ACTION_PLAN_SCHEMA_V1 = {
  type: "object",
  additionalProperties: false,
  properties: {
    version: { type: "string", enum: [ACTION_PLAN_VERSION] },
    canvasType: { type: ["string", "null"] },
    needsClarification: { type: "boolean" },
    clarificationQuestions: { type: "array", items: { type: "string" } },
    summary: { type: ["string", "null"] },
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          kind: {
            type: "string",
            enum: [
              "build",
              "add_or_insert",
              "remove",
              "update",
              "replace_node",
              "explain",
            ],
          },

          // Common targeting
          target: {
            type: ["object", "null"],
            additionalProperties: false,
            properties: {
              by: { type: "string", enum: ["selected", "key", "type", "label", "semantic"] },
              value: { type: ["string", "null"] },
            },
          },
          scope: { type: ["string", "null"], enum: [null, "one", "all", "list", "nth"] },

          // Build/add/insert
          insertMode: { type: ["string", "null"], enum: [null, "append", "insert_after", "insert_before"] },
          anchorTarget: { type: ["object", "null"] },
          planNodes: { type: ["array", "null"], items: { type: "object" } },

          // Update
          patchIntent: { type: ["object", "null"] },

          // Replace node
          replacementRequest: { type: ["string", "null"] },

          // Explain
          message: { type: ["string", "null"] },

          // Risk (planner estimate; final enforcement is local)
          risk: {
            type: ["object", "null"],
            additionalProperties: false,
            properties: {
              level: { type: "string", enum: ["low", "high"] },
              requiresConfirmation: { type: "boolean" },
              reason: { type: ["string", "null"] },
            },
          },
        },
        required: ["id", "kind"],
      },
    },
  },
  required: ["version", "needsClarification", "clarificationQuestions", "steps"],
};
