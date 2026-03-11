import { CONNECTION_SETUP_V2_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

export const CONNECTION_SETUP_V2_NODE = {
  cmsId: "connection-setup-v2",
  _src: "https://cdn-v1.tinycommand.com/connection-icon.svg",
  name: "Connection Setup",
  description: "Connect to external services and APIs",
  type: CONNECTION_SETUP_V2_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#F59E0B",
  foreground: "#fff",
  dark: "#d97706",
  light: "#F59E0B",
  hasTestModule: true,
  canSkipTest: false,
};

export const CONNECTION_TYPES = [
  {
    id: "OAUTH",
    label: "OAuth 2.0",
    description: "Secure authentication with external services",
    color: "#3b82f6",
  },
  {
    id: "API_KEY",
    label: "API Key",
    description: "Simple key-based authentication",
    color: "#22c55e",
  },
  {
    id: "BASIC",
    label: "Basic Auth",
    description: "Username and password authentication",
    color: "#8b5cf6",
  },
  {
    id: "CUSTOM",
    label: "Custom",
    description: "Configure custom authentication headers",
    color: "#f59e0b",
  },
];

export const CONNECTION_TEMPLATES = [
  {
    id: "oauth-setup",
    name: "OAuth Setup",
    description: "Connect using OAuth 2.0 flow for secure authorization",
    icon: "Shield",
    defaults: {
      connectionType: "OAUTH",
      connectionName: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "OAuth Connection" }] },
      credentials: {},
    },
  },
  {
    id: "api-key",
    name: "API Key",
    description: "Connect using a simple API key authentication",
    icon: "Key",
    defaults: {
      connectionType: "API_KEY",
      connectionName: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "API Key Connection" }] },
      credentials: {},
    },
  },
  {
    id: "database-connection",
    name: "Database Connection",
    description: "Connect to databases with connection strings",
    icon: "Database",
    defaults: {
      connectionType: "BASIC",
      connectionName: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "Database Connection" }] },
      credentials: {},
    },
  },
];
