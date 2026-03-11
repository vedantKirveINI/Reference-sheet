import extensionIcons from "../../assets/extensions";
import { TINY_GPT_CONSULTANT_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TINYGPT_CONSULTANT_NODE = {
  _src: extensionIcons.tinyGptConsultant,
  name: "Tiny GPT Consultant",
  description: "",
  type: TINY_GPT_CONSULTANT_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6200EE 27.7%, #A676EA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#6200EE",
  light: "#A676EA",
};

export const CONSULTATION_AREA_SPECIFICATION = {
  BUSINESS_STARTERGY: "Business Startergy",
  FINANCE: "Finance",
  TECHNOLOGY: "Technology",
};

export const RECOMMENDATION_DETAIL_LEVEL = {
  BRIEF: "Brief",
  MODERATE: "Moderate",
  DETAILED: "Detailed",
};

export const REPORT_FORMAT_SELECTION = {
  SLIDE_DECK: "Slide Deck",
  REPORT: "Report",
  SPREADSHEET: "Spreadsheet",
};

export default TINYGPT_CONSULTANT_NODE;
