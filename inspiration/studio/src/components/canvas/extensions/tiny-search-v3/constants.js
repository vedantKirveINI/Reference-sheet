import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { TINY_SEARCH_V2 } from "../constants/types";

export const TINY_SEARCH_V3_NODE = {
  cmsId: "tiny-search-v3",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1757394192884/TinySearch.svg",
  name: "Tiny Search",
  type: TINY_SEARCH_V2,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(135deg, #8133F1 0%, #360083 100%)",
  foreground: "#fff",
  dark: "#360083",
  light: "#8133F1",
  hasTestModule: true,
  canSkipTest: true,
  credits: 10,
  meta: {
    search_keys: ["Search", "Web", "Query", "Research", "Find", "Lookup"],
  },
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: TINY_SEARCH_V3_NODE.dark,
  activeTabBg: TINY_SEARCH_V3_NODE.dark,
  activeTabText: "#ffffff",
};

export const SEARCH_TEMPLATES = [
  {
    id: "market-research",
    name: "Market Research",
    description: "Analyze industry trends and market dynamics",
    icon: "TrendingUp",
    iconBg: "#10B981",
    defaultQuery: "Latest trends and market analysis for",
    defaultFocus: "industry trends, market size, growth projections",
  },
  {
    id: "competitor-analysis",
    name: "Competitor Analysis",
    description: "Research competitors and their strategies",
    icon: "Target",
    iconBg: "#F59E0B",
    defaultQuery: "Competitor analysis and comparison for",
    defaultFocus: "competitor products, pricing, market position",
  },
  {
    id: "lead-generation",
    name: "Lead Generation",
    description: "Find potential customers and prospects",
    icon: "Users",
    iconBg: "#6366F1",
    defaultQuery: "Find companies and contacts in",
    defaultFocus: "company profiles, decision makers, contact information",
  },
  {
    id: "content-research",
    name: "Content Research",
    description: "Gather content ideas and inspiration",
    icon: "FileText",
    iconBg: "#EC4899",
    defaultQuery: "Content ideas and topics about",
    defaultFocus: "trending topics, popular content, audience interests",
  },
];

export const getSearchTemplateById = (id) => {
  return SEARCH_TEMPLATES.find((t) => t.id === id) || null;
};
