import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import { AGENT_TINY_SCOUT } from "../../constants/types";
import extensionIcons from "../../../assets/extensions";

export { AGENT_TINY_SCOUT };

export const AGENT_SCOUT_V3_NODE = {
  cmsId: "agent-scout-v3",
  _src: extensionIcons.tinyGPTResearcher,
  name: "Tiny Scout",
  type: AGENT_TINY_SCOUT,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(135deg, #8133F1 0%, #360083 100%)",
  foreground: "#fff",
  dark: "#360083",
  light: "#8133F1",
  hasTestModule: true,
  canSkipTest: true,
  credits: 10,
  meta: {
    search_keys: ["Scout", "Research", "Prospect", "Company", "Sales", "Outreach"],
  },
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: AGENT_SCOUT_V3_NODE.dark,
  activeTabBg: AGENT_SCOUT_V3_NODE.dark,
  activeTabText: "#ffffff",
};

export const SCOUT_TEMPLATES = [
  {
    id: "sales-outreach",
    name: "Sales Outreach",
    description: "Prepare personalized outreach with deep prospect insights",
    icon: "Mail",
    iconBg: "#10B981",
    researchCategories: ["company-overview", "people-leadership", "sales-signals"],
  },
  {
    id: "competitive-intel",
    name: "Competitive Intelligence",
    description: "Analyze competitors to identify opportunities and threats",
    icon: "Target",
    iconBg: "#F59E0B",
    researchCategories: ["company-overview", "market-intel"],
  },
  {
    id: "investor-research",
    name: "Investor Research",
    description: "Prepare for fundraising with comprehensive investor insights",
    icon: "TrendingUp",
    iconBg: "#6366F1",
    researchCategories: ["company-overview", "people-leadership", "market-intel"],
  },
  {
    id: "partnership-eval",
    name: "Partnership Evaluation",
    description: "Evaluate potential partners for strategic alignment",
    icon: "Handshake",
    iconBg: "#EC4899",
    researchCategories: ["company-overview", "people-leadership", "market-intel", "sales-signals"],
  },
];

export const RESEARCH_CATEGORIES = [
  {
    id: "company-overview",
    name: "Company Overview",
    description: "Website, pricing, and revenue information",
    icon: "Building2",
    iconBg: "#3B82F6",
    researchPoints: ["search_website", "search_pricing", "search_revenue"],
  },
  {
    id: "people-leadership",
    name: "People & Leadership",
    description: "Key people, decision makers, and LinkedIn profiles",
    icon: "Users",
    iconBg: "#8133F1",
    researchPoints: ["search_key_people", "search_linkedin"],
  },
  {
    id: "market-intel",
    name: "Market Intelligence",
    description: "Competitors, funding, and industry news",
    icon: "TrendingUp",
    iconBg: "#10B981",
    researchPoints: ["search_funding", "search_news"],
  },
  {
    id: "sales-signals",
    name: "Sales Signals",
    description: "Pain points, growth indicators, and conversation starters",
    icon: "Target",
    iconBg: "#F59E0B",
    researchPoints: ["search_pain_points", "search_user_growth", "search_customer_reviews", "search_conversation_levers", "search_fit_score", "search_marketing_campaigns"],
  },
];

export const RESEARCH_POINTS = {
  search_website: "Company Website",
  search_pricing: "Company Pricing",
  search_revenue: "Company Revenue",
  search_key_people: "Key People",
  search_linkedin: "Company LinkedIn",
  search_funding: "Funding History",
  search_news: "Recent News",
  search_pain_points: "Pain Points",
  search_user_growth: "User Growth",
  search_customer_reviews: "Customer Reviews",
  search_conversation_levers: "Conversation Levers",
  search_marketing_campaigns: "Marketing Campaigns",
  search_fit_score: "Fit Score",
};

export const OUTPUT_TITLES = {
  hero_marketing_campaign: "Hero Marketing Campaign",
  key_people: "Key People",
  company_overview: "Company Overview",
  value_proposition: "Value Proposition",
  conversation_levers: "Conversation Levers",
  full_research_report: "Full Research Report",
  growth_indicators: "Growth Indicators",
  qualification_score: "Qualification Score",
  references: "References",
};

export const DEFAULT_OUTPUT_TITLES = {
  hero_marketing_campaign: true,
  key_people: true,
  company_overview: true,
  value_proposition: true,
  conversation_levers: true,
  full_research_report: true,
  growth_indicators: true,
  qualification_score: true,
  references: true,
};

export const DEFAULT_OUTPUT_SCHEMA = [
  { key: "hero_marketing_campaign", type: "string", description: "Marketing campaign summary for the prospect" },
  { key: "key_people", type: "string", description: "Key contacts and decision makers at the company" },
  { key: "company_overview", type: "string", description: "Company summary and key business facts" },
  { key: "value_proposition", type: "string", description: "How your solution addresses their needs" },
  { key: "conversation_levers", type: "string", description: "Topics and triggers for sales conversations" },
  { key: "full_research_report", type: "string", description: "Complete research findings and analysis" },
  { key: "growth_indicators", type: "string", description: "Signals of company growth and expansion" },
  { key: "qualification_score", type: "string", description: "Lead qualification assessment" },
  { key: "references", type: "string", description: "Sources and references used in research" },
];

export const getScoutTemplateById = (id) => {
  return SCOUT_TEMPLATES.find((t) => t.id === id) || null;
};
