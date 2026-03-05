import extensionIcons from "../../assets/extensions";
import { TINY_GPT_RESEARCHER_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TINYGPT_RESEARCHER_NODE = {
  _src: extensionIcons.tinyGPTResearcher,
  name: "Tiny GPT Researcher",
  type: TINY_GPT_RESEARCHER_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6200EE 27.7%, #A676EA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#6200EE",
  light: "#A676EA",
  hasTestModule: false,
  canSkipTest: true,
};

export const DEPTH_OF_SEARCH = {
  SURFACE_LEVEL: "Surface-Level",
  MODERATE: "Moderate",
  IN_DEPTH: "In-Depth",
};

export const FACT_CHECK_LEVEL = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export const OUTPUT_FORMAT = {
  SUMMARY: "Summary",
  BULLET_POINTS: "Bullet Points",
  DETAILED_REPORT: "Detailed Report",
};

export const SOURCE_PREFERENCE = {
  ACADEMIC_JOURNALS: "Academic Journals",
  NEWS_WEBSITES: "News Websites",
  FORUMS: "Forums",
  BLOGS: "Blogs",
  GOVERNMENT_SOURCES: "Government Sources",
  OTHER: "Other",
};

export const UPDATE_FREQUENCY = {
  REALTIME: "Real-time",
  DAILY: "Daily",
  WEEKLY: "Weekly",
};

export default TINYGPT_RESEARCHER_NODE;
