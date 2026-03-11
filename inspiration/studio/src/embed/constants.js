/**
 * Node types that require authentication to configure (e.g. integrations, connections).
 * When the user tries to configure one of these in embed without auth, show sign-up CTA.
 */
export const REQUIRES_AUTH_NODE_TYPES = [
  "Integration",
  "HTTP",
  "HTTP_V5",
  "HTTP_V4",
  "WEBHOOK_V2",
  "HITL",
  "HITL_V2",
  "SELF_EMAIL",
  "SELF_EMAIL_V2",
  "CREATE_RECORD_V2",
  "Update Record",
  "UPDATE_RECORD_V2",
  "DELETE_RECORD_V2",
  "DB_FIND_ALL",
  "DB_FIND_ONE",
  "DB_FIND_ALL_V2",
  "DB_FIND_ONE_V2",
  "CREATE_SHEET_RECORD_V2",
  "CREATE_SHEET_RECORD_V3",
  "UPDATE_SHEET_RECORD_V2",
  "UPDATE_SHEET_RECORD_V3",
  "DELETE_SHEET_RECORD_V2",
  "FIND_ALL_SHEET_RECORD_V2",
  "FIND_ONE_SHEET_RECORD_V2",
  "TIME_BASED_TRIGGER_V2",
  "SHEET_TRIGGER_V2",
  "TRIGGER_SETUP",
  "Connection Setup",
  "CONNECTION_SETUP_V2",
  "GPT",
  "GPT_V3",
  "TINYGPT",
  "TINYGPT_V2",
  "TINYGPT_V3",
  "TINYGPT_V4",
  "Agent",
  "AGENT_NODE_V2",
  "AGENT_NODE_V3",
];

export function nodeTypeRequiresAuth(nodeType) {
  return REQUIRES_AUTH_NODE_TYPES.includes(nodeType);
}
