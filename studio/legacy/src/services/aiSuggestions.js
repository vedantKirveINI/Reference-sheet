const AI_TIMEOUT = 2000;

let openaiClient = null;
let clientCheckDone = false;
let credentialsAvailable = false;

function getApiKey() {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env?.VITE_OPENAI_API_KEY) {
      return import.meta.env.VITE_OPENAI_API_KEY;
    }
  } catch {
  }
  return null;
}

async function getOpenAIClient() {
  if (clientCheckDone) {
    return credentialsAvailable ? openaiClient : null;
  }

  clientCheckDone = true;
  const apiKey = getApiKey();
  
  if (!apiKey) {
    credentialsAvailable = false;
    openaiClient = null;
    return null;
  }

  try {
    const { default: OpenAI } = await import("openai");
    
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
    credentialsAvailable = true;
    return openaiClient;
  } catch (error) {
    credentialsAvailable = false;
    openaiClient = null;
    return null;
  }
}

export async function getAISuggestions(context, availableNodes) {
  const { selectedNode, hasTrigger, workflowShape, searchText } = context;

  if (!availableNodes || availableNodes.length === 0) {
    return { suggestions: [], source: "fallback" };
  }

  const client = await getOpenAIClient();
  
  if (!client) {
    return getStaticSuggestions(context, availableNodes);
  }

  const availableNodeTypes = availableNodes
    .slice(0, 50)
    .map((n) => ({
      id: n.id || n.type,
      name: n.name,
      category: n.category || "unknown",
      type: n.type,
    }));

  const prompt = buildPrompt({
    selectedNode,
    hasTrigger,
    workflowShape,
    searchText,
    availableNodeTypes,
  });

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_TIMEOUT);

    const response = await client.chat.completions.create(
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a workflow automation assistant. Given context about a user's current workflow state, suggest the most relevant next nodes they might want to add. Return ONLY a JSON object with a "suggestions" array containing node IDs, max 5 items. No explanations.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
        response_format: { type: "json_object" },
      },
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return getStaticSuggestions(context, availableNodes);
    }

    const parsed = JSON.parse(content);
    const suggestedIds = parsed.suggestions || parsed.nodeIds || [];

    const validSuggestions = suggestedIds
      .slice(0, 5)
      .map((id) => availableNodes.find((n) => (n.id || n.type) === id))
      .filter(Boolean);

    if (validSuggestions.length === 0) {
      return getStaticSuggestions(context, availableNodes);
    }

    return { suggestions: validSuggestions, source: "ai" };
  } catch (error) {
    return getStaticSuggestions(context, availableNodes);
  }
}

function getStaticSuggestions(context, availableNodes) {
  const { selectedNode, hasTrigger } = context;
  
  const STATIC_SUGGESTIONS = {
    HTTP: ["TRANSFORMER", "IF_ELSE_V2", "UPSERT", "SEND_EMAIL"],
    FIND_ALL: ["ITERATOR", "TRANSFORMER", "IF_ELSE_V2", "AGGREGATOR"],
    FIND_ONE: ["IF_ELSE_V2", "TRANSFORMER", "UPDATE", "SEND_EMAIL"],
    ITERATOR: ["IF_ELSE_V2", "TRANSFORMER", "UPSERT", "AGGREGATOR"],
    TRANSFORMER: ["IF_ELSE_V2", "HTTP", "UPSERT", "SEND_EMAIL"],
    IF_ELSE_V2: ["HTTP", "SEND_EMAIL", "UPSERT", "TRANSFORMER"],
    FORM_TRIGGER: ["TRANSFORMER", "IF_ELSE_V2", "SEND_EMAIL", "UPSERT"],
    TABLE_TRIGGER: ["TRANSFORMER", "IF_ELSE_V2", "SEND_EMAIL", "HTTP"],
    SCHEDULE_TRIGGER: ["FIND_ALL", "HTTP", "SEND_EMAIL", "TRANSFORMER"],
    WEBHOOK: ["TRANSFORMER", "IF_ELSE_V2", "HTTP", "UPSERT"],
    TINY_GPT: ["TRANSFORMER", "SEND_EMAIL", "UPSERT", "HTTP"],
    SEND_EMAIL: ["DELAY", "IF_ELSE_V2", "UPSERT"],
    UPSERT: ["IF_ELSE_V2", "SEND_EMAIL", "HTTP"],
    CREATE: ["IF_ELSE_V2", "SEND_EMAIL", "TRANSFORMER"],
    UPDATE: ["IF_ELSE_V2", "SEND_EMAIL", "TRANSFORMER"],
  };

  const DEFAULT_SUGGESTIONS = hasTrigger 
    ? ["HTTP", "TRANSFORMER", "IF_ELSE_V2", "FIND_ALL", "SEND_EMAIL"]
    : ["FORM_TRIGGER", "SCHEDULE_TRIGGER", "HTTP", "TRANSFORMER", "IF_ELSE_V2"];

  let suggestedTypes = DEFAULT_SUGGESTIONS;
  
  if (selectedNode?.type) {
    const nodeType = selectedNode.type.toUpperCase();
    for (const [key, suggestions] of Object.entries(STATIC_SUGGESTIONS)) {
      if (nodeType.includes(key)) {
        suggestedTypes = suggestions;
        break;
      }
    }
  }

  if (hasTrigger) {
    suggestedTypes = suggestedTypes.filter(
      (t) => !["TRIGGER", "FORM_TRIGGER", "TABLE_TRIGGER", "SCHEDULE_TRIGGER", "WEBHOOK"].includes(t)
    );
  }

  const suggestions = suggestedTypes
    .map((type) => 
      availableNodes.find((n) => 
        n.type?.toUpperCase().includes(type) || n.subType?.toUpperCase().includes(type)
      )
    )
    .filter(Boolean)
    .slice(0, 5);

  return { suggestions, source: "static" };
}

function buildPrompt({ selectedNode, hasTrigger, workflowShape, searchText, availableNodeTypes }) {
  let prompt = "Context:\n";

  if (selectedNode) {
    prompt += `- Currently selected node: ${selectedNode.name || selectedNode.type}`;
    if (selectedNode.integrationName) {
      prompt += ` (Integration: ${selectedNode.integrationName})`;
    }
    prompt += "\n";
  } else {
    prompt += "- No node currently selected\n";
  }

  prompt += `- Trigger exists in workflow: ${hasTrigger ? "Yes" : "No"}\n`;

  if (workflowShape && workflowShape.length > 0) {
    prompt += `- Current workflow shape: ${workflowShape.join(" → ")}\n`;
  }

  if (searchText) {
    prompt += `- User search intent: "${searchText}"\n`;
  }

  prompt += "\nAvailable nodes to choose from:\n";
  prompt += JSON.stringify(availableNodeTypes, null, 2);

  prompt += `\n\nRespond with a JSON object: { "suggestions": ["nodeId1", "nodeId2", ...] }`;
  prompt += "\nMax 5 suggestions. Only use IDs from the available nodes list.";

  if (hasTrigger) {
    prompt += "\nNote: A trigger already exists, so de-prioritize trigger nodes.";
  }

  return prompt;
}

export function logAISuggestionContext(context, result) {
}
