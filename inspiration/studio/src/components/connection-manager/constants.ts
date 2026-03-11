import { AuthType } from "./types";

export const AUTH_TYPE_LABELS: Record<AuthType, string> = {
  oauth2: "OAuth",
  database: "Database",
  "api-key": "API Key",
  basic: "Basic Auth",
  custom: "Custom",
};

export const AUTH_TYPE_BADGE_COLORS: Record<AuthType, { bg: string; text: string }> = {
  oauth2: { bg: "bg-blue-100", text: "text-blue-700" },
  database: { bg: "bg-emerald-100", text: "text-emerald-700" },
  "api-key": { bg: "bg-amber-100", text: "text-amber-700" },
  basic: { bg: "bg-purple-100", text: "text-purple-700" },
  custom: { bg: "bg-slate-100", text: "text-slate-700" },
};

export const CONNECTION_STATUS_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  connected: { bg: "bg-green-100", text: "text-green-700", icon: "text-green-500" },
  expired: { bg: "bg-amber-100", text: "text-amber-700", icon: "text-amber-500" },
  error: { bg: "bg-red-100", text: "text-red-700", icon: "text-red-500" },
  pending: { bg: "bg-slate-100", text: "text-slate-500", icon: "text-slate-400" },
};

export const getContextualCopy = (integrationName?: string, authType?: AuthType) => {
  const name = integrationName || "this service";
  
  const emptyStateCopy: Record<AuthType, { title: string; description: string }> = {
    oauth2: {
      title: `Connect your ${name} account`,
      description: `Authorize access to ${name} to enable automation and data sync.`,
    },
    database: {
      title: `Connect your ${name} database`,
      description: `Add your database credentials to start reading and writing data.`,
    },
    "api-key": {
      title: `Add your ${name} API key`,
      description: `Enter your API credentials to connect to ${name}.`,
    },
    basic: {
      title: `Connect to ${name}`,
      description: `Enter your username and password to authenticate.`,
    },
    custom: {
      title: `Configure ${name} connection`,
      description: `Complete the setup to connect to ${name}.`,
    },
  };

  return emptyStateCopy[authType || "oauth2"];
};

export const getButtonLabel = (authType?: AuthType): string => {
  switch (authType) {
    case "oauth2":
      return "Connect Account";
    case "database":
      return "Add Database";
    case "api-key":
      return "Add API Key";
    case "basic":
      return "Add Credentials";
    default:
      return "New Connection";
  }
};
