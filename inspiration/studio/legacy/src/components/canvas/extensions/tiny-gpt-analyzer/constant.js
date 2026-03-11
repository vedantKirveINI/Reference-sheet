import extensionIcons from "../../assets/extensions";
import { TINY_GPT_ANALYZER_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TINYGPT_ANALYZER_NODE = {
  _src: extensionIcons.tinyGPTResearcher,
  name: "Tiny GPT Analyzer",
  description: "",
  type: TINY_GPT_ANALYZER_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6200EE 27.7%, #A676EA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#6200EE",
  light: "#A676EA",
  hasTestModule: false,
  canSkipTest: true,
};

export const ANALYSIS_FOCUS = {
  TREND_IDENTIFICATION: "Trend Identification",
  SENTIMENT_ANALYSIS: "Sentiment Analysis",
  STATISTICAL_SUMMARY: "Statistical Summary",
};

export const DATA_TYPES_SPECIFICATION = {
  TEXT: "Text",
  NUMBERS: "Numbers",
  IMAGES: "Images",
};

export const FREQUENCY_OF_ANALYSIS = {
  REAL_TIME: "Real-time",
  PERIODIC: "Periodic",
  ON_DEMAND: "On-demand",
};
export const REPORTING_FORMAT = {
  PDF: "PDF",
  SPREADSHEET: "Spreadsheet",
  PRESENTATION: "Presentation",
};

export const VISUALIZATION_PREFERENCE = {
  GRAPH: "Graph",
  CHART: "Chart",
  WORD_CLOUD: "Word Cloud",
};

export default TINYGPT_ANALYZER_NODE;
