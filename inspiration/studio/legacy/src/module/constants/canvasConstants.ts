export const CANVAS_MODES = Object.freeze({
  INTEGRATION_CANVAS: "INTEGRATION_CANVAS", //IC
  WORKFLOW_CANVAS: "WORKFLOW_CANVAS", //FC
  CMS_CANVAS: "CMS_CANVAS", //CMS
  WC_CANVAS: "WC_CANVAS", //WC
  AGENT_CANVAS: "AGENT_CANVAS", //AGENT
  TOOL_CANVAS: "TOOL_CANVAS",
});

export const getSubdomain = () => {
  const hostname = window?.location?.hostname || "";
  const subdomain = hostname.split(".")[0];
  return subdomain;
};

export const CANVAS_MODE = () => {
  return CANVAS_MODES.WC_CANVAS;
  switch (getSubdomain()) {
    case "creator":
      return CANVAS_MODES.WORKFLOW_CANVAS;
    case "fc":
      return CANVAS_MODES.WORKFLOW_CANVAS;
    case "workflows":
      return CANVAS_MODES.WC_CANVAS;
    case "wc":
      return CANVAS_MODES.WC_CANVAS;
    case "canvas":
      return CANVAS_MODES.INTEGRATION_CANVAS;
    case "ic":
      return CANVAS_MODES.INTEGRATION_CANVAS;
    case "integrator":
      return CANVAS_MODES.CMS_CANVAS;
    case "cms":
      return CANVAS_MODES.CMS_CANVAS;
    case "agent":
      return CANVAS_MODES.AGENT_CANVAS;
    case "tool":
      return CANVAS_MODES.TOOL_CANVAS;
    default:
      return CANVAS_MODES.WORKFLOW_CANVAS; // fallback
  }
};

export const getCanvasTheme = () => {
  const canvasMode = CANVAS_MODE();

  switch (canvasMode) {
    case CANVAS_MODES.WORKFLOW_CANVAS:
      return {
        background:
          "linear-gradient(213deg, #FD5D2D 8.86%, #FB6A2B 27.97%, #F58024 44.96%, #F2901D 60.3%, #F09A19 94.4%)",
        foreground: "#fff",
        dark: "#FD5D2D",
        light: "#F09A19",
      };
    case CANVAS_MODES.INTEGRATION_CANVAS:
      return {
        background: "linear-gradient(180deg, #1C3693 0%, #2C6FDA 100%)",
        foreground: "#fff",
        dark: "#1C3693",
        light: "#2C6FDA",
      };
    case CANVAS_MODES.WC_CANVAS:
      return {
        background: "linear-gradient(180deg, #1C3693 0%, #2C6FDA 100%)",
        foreground: "#fff",
        dark: "#1C3693",
        light: "#2C6FDA",
      };
    case CANVAS_MODES.CMS_CANVAS:
      return {
        background: "linear-gradient(334deg, #EA59ED 16.61%, #820085 83.39%)",
        foreground: "#fff",
        dark: "#820085",
        light: "#EA59ED",
      };
    case CANVAS_MODES.AGENT_CANVAS:
      return {
        background: "linear-gradient(334deg, #8133F1 16.61%, #360083 83.39%)",
        foreground: "#fff",
        dark: "#360083",
        light: "#8133F1",
      };
    default:
      return {
        background: "linear-gradient(180deg, #1C3693 0%, #2C6FDA 100%)",
        foreground: "#fff",
        dark: "#1C3693",
        light: "#2C6FDA",
      };
  }
};

export const getClarityId = () => {
  switch (getSubdomain()) {
    case "creator":
      return "q2csb4uh9d";
    case "fc":
      return "q2csb4uh9d";
    case "workflows":
      return "q2ct0r1rzc";
    case "wc":
      return "q2ct0r1rzc";
    case "canvas":
      return "q5zged4ley";
    case "ic":
      return "q5zged4ley";
    case "integrator":
      return "q2csfscf91";
    case "cms":
      return "q2csfscf91";
    case "agent":
      return "q5zrkm8kb6";
    default:
      return "q2ct0r1rzc";
  }
};

export const CANVAS_HOSTS = {
  RECIPE_BUILDER: "recipe-builder",
};
