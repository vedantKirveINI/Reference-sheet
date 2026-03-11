// import { ODSIcon as Icon } from '@src/module/ods';
// import { serverConfig } from '@src/module/ods';
import { ODSIcon as Icon, serverConfig } from "@src/module/ods";
import { MODE } from "../constants/mode";

const redirectToLanding = () => {
  open(serverConfig.WC_LANDING_URL);
};
export const getIcon = (mode) => {
  switch (mode) {
    case MODE.WORKFLOW_CANVAS:
      return (
        <Icon
          outeIconName="OUTEFormIcon"
          onClick={redirectToLanding}
          buttonProps={{ sx: { padding: 0 } }}
          outeIconProps={{
            sx: { width: "2.5rem", height: "2.5rem", borderRadius: "0.375rem" },
          }}
        />
      );
    case MODE.INTEGRATION_CANVAS:
    case MODE.WC_CANVAS:
      return (
        <Icon
          outeIconName="OUTEWorkflowIcon"
          onClick={redirectToLanding}
          buttonProps={{ sx: { padding: 0 } }}
          outeIconProps={{
            sx: { width: "2.5rem", height: "2.5rem", borderRadius: "0.375rem" },
          }}
        />
      );
    case MODE.CMS_CANVAS:
      return (
        <Icon
          outeIconName="OUTECMSIcon"
          onClick={redirectToLanding}
          buttonProps={{ sx: { padding: 0 } }}
          outeIconProps={{
            sx: { width: "2.5rem", height: "2.5rem", borderRadius: "0.375rem" },
          }}
        />
      );
    case MODE.AGENT_CANVAS:
      return (
        <Icon
          onClick={redirectToLanding}
          buttonProps={{ sx: { padding: 0 } }}
          outeIconName="TinyAgentLogo"
          outeIconProps={{
            sx: { width: "2.5rem", height: "2.5rem", borderRadius: "0.375rem" },
          }}
        />
      );
    case MODE.TOOL_CANVAS:
      return (
        <Icon
          onClick={redirectToLanding}
          buttonProps={{ sx: { padding: 0 } }}
          outeIconName="TinyAgentLogo"
          outeIconProps={{
            sx: { width: "2.5rem", height: "2.5rem", borderRadius: "0.375rem" },
          }}
        />
      );
    default:
      return null;
  }
};

export const getCanvasMetaData = (mode) => {
  switch (mode) {
    case MODE.WORKFLOW_CANVAS:
      return {
        title: "TinyForms",
        description:
          "A TinyCommand product. Drag and drop dynamic form tool to build your custom flow. Give personalized and highly dynamic experience to your users by integrating any third party apps as per your business logic.",
      };
    case MODE.INTEGRATION_CANVAS:
      return {
        title: "TinyIntegration",
        description:
          "A TinyCommand product. The easiest way to build powerful automations. Connect apps, run logic, and drop in AI agents - no complex setup, no code. Just smart workflows that move with you.",
      };
    case MODE.CMS_CANVAS:
      return {
        title: "TinyCMS",
        description:
          "A TinyCommand product. Create engaging events with TinyCMS. Add event details, speakers, and schedule. Share your event with the world or keep it private. A TinyCommand product.",
      };
    case MODE.WC_CANVAS:
      return {
        title: "TinyWorkflows",
        description:
          "A TinyCommand product. The easiest way to build powerful automations. Connect apps, run logic, and drop in AI agents - no complex setup, no code. Just smart workflows that move with you.",
      };
    case MODE.AGENT_CANVAS:
      return {
        title: "TinyAgents",
        description:
          " TinyAgents give you real power, plug them into TinyWorkflows to run tasks, draft follow-ups, or make decisions on live data. Configure TinyAgents with no code, just prompts. A TinyCommand product.",
      };
    case MODE.TOOL_CANVAS:
      return {
        title: "TinyTools",
        description:
          "A TinyCommand product. Create custom AI tools with TinyTools. Add prompts, configure inputs, and drop them into TinyWorkflows. No code, just prompts. A TinyCommand product.",
      };
    default:
      return null;
  }
};

export const getSaveDialogTitle = (mode) => {
  switch (mode) {
    case MODE.WORKFLOW_CANVAS:
      return "Form";
    case MODE.INTEGRATION_CANVAS:
      return "Integration";
    case MODE.CMS_CANVAS:
      return "Event";
    case MODE.WC_CANVAS:
      return "Workflow";
    case MODE.AGENT_CANVAS:
      return "Agent";
    case MODE.TOOL_CANVAS:
      return "AI Tool";
    default:
      return "Workflow";
  }
};

// export const getFavIcon = (mode) => {
//   switch (mode) {
//     case MODE.WORKFLOW_CANVAS:
//       return "/fc-favicon.ico";
//     case MODE.INTEGRATION_CANVAS:
//       return "/ic-favicon.ico";
//     case MODE.CMS_CANVAS:
//       return "/cms-favicon.ico";
//     case MODE.WC_CANVAS:
//       return "/wc-favicon.ico";
//     default:
//       return null;
//   }
// };

export const updateTitle = ({ title, description }) => {
  document.title = title;
  document
    .querySelector('meta[name="description"]')
    .setAttribute("content", description);
};
export const updateFavIcon = (icon) => {
  const link =
    document.querySelector("link[rel*='icon']") ||
    document.createElement("link");
  link.type = "image/x-icon";
  link.rel = "icon";
  link.href = icon;
  document.getElementsByTagName("head")[0].appendChild(link);
};

export const getFormattedDate = (inputDate) => {
  if (!inputDate) return "";
  const date = new Date(inputDate);

  // Get components of the date
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  // Determine AM/PM
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedHours = String(hours).padStart(2, "0");

  // Format the date and time
  const formattedDate = `${day}/${month}/${year}, ${formattedHours}:${minutes}${ampm}`;
  return formattedDate;
};

export const decodeParameters = (base64String) => {
  if (!base64String || typeof base64String !== "string") {
    return {};
  }
  
  // Strip any query parameter prefix (e.g., "q=") if present
  let cleaned = base64String.trim();
  if (cleaned.startsWith("q=")) {
    cleaned = cleaned.substring(2);
  }
  
  try {
    // Try decoding directly first (most common case)
    return JSON.parse(atob(cleaned));
  } catch (error) {
    // If that fails, try URL-decoding first (in case the base64 was URL-encoded)
    try {
      const urlDecoded = decodeURIComponent(cleaned);
      return JSON.parse(atob(urlDecoded));
    } catch (e) {
      console.warn("Failed to decode parameters:", cleaned.substring(0, 50), e);
      return {};
    }
  }
};
export const encodeParameters = (data) => {
  return btoa(JSON.stringify(data));
};

export const getAnnotation = (mode, eventType) => {
  switch (mode) {
    case MODE.INTEGRATION_CANVAS:
      return "IC";
    case MODE.WORKFLOW_CANVAS:
      return "FC";
    case MODE.CMS_CANVAS:
      return eventType;
    case MODE.WC_CANVAS:
      return "WC";
    case MODE.AGENT_CANVAS:
      return "AGENT";
    case MODE.TOOL_CANVAS:
      return "TOOL";
    default:
      return "";
  }
};

export const getBorderStyle = (mode) => {
  switch (mode) {
    case MODE.INTEGRATION_CANVAS:
      return {
        borderBottom: "1px solid #358CFF",
      };
    case MODE.WORKFLOW_CANVAS:
      return {
        borderBottom: "1px solid #FFC839",
      };
    case MODE.CMS_CANVAS:
      return {
        borderBottom: "1px solid #cfd8dc",
      };
    case MODE.WC_CANVAS:
      return {
        borderBottom: "1px solid #cfd8dc",
      };
    default:
      return {
        borderBottom: "1px solid #cfd8dc",
      };
  }
};
