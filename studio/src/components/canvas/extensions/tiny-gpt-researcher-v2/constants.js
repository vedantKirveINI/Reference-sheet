import extensionIcons from "../../assets/extensions";
import { TINY_GPT_RESEARCHER_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { Zap, BarChart3, Microscope, FileText, List, BookText, Shield, ShieldCheck, ShieldAlert } from "lucide-react";

export { TINY_GPT_RESEARCHER_TYPE };

export const TINYGPT_RESEARCHER_V2_NODE = {
  cmsId: "tiny-gpt-researcher-v2",
  _src: extensionIcons.tinyGPTResearcher,
  name: "Tiny GPT Researcher",
  description: "AI-powered research assistant",
  type: TINY_GPT_RESEARCHER_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6200EE 27.7%, #A676EA 100%)",
  foreground: "#fff",
  dark: "#6200EE",
  light: "#A676EA",
  hasTestModule: true,
  canSkipTest: false,
  credits: 20,
  meta: {
    search_keys: ["Research", "AI", "Analysis", "GPT"],
  },
};

export const RESEARCH_DEPTH_OPTIONS = [
  { 
    id: "surface", 
    label: "Quick Scan", 
    description: "Fast overview with key facts",
    icon: Zap,
  },
  { 
    id: "moderate", 
    label: "Balanced", 
    description: "Good depth with context",
    icon: BarChart3,
  },
  { 
    id: "in-depth", 
    label: "Deep Dive", 
    description: "Comprehensive with citations",
    icon: Microscope,
  },
];

export const OUTPUT_FORMAT_OPTIONS = [
  { id: "summary", label: "Summary", description: "Concise paragraph format", icon: FileText },
  { id: "bullet-points", label: "Bullet Points", description: "Scannable key points", icon: List },
  { id: "detailed-report", label: "Full Report", description: "Structured report", icon: BookText },
];

export const SOURCE_OPTIONS = [
  { id: "academic", label: "Academic Journals", description: "Peer-reviewed research" },
  { id: "news", label: "News & Media", description: "Current events and reporting" },
  { id: "government", label: "Government Sources", description: "Official data and reports" },
  { id: "industry", label: "Industry Reports", description: "Market and sector analysis" },
  { id: "blogs", label: "Blogs & Forums", description: "Community insights and opinions" },
];

export const FACT_CHECK_OPTIONS = [
  { id: "low", label: "Standard", description: "Basic verification", icon: Shield },
  { id: "medium", label: "Enhanced", description: "Cross-reference sources", icon: ShieldCheck },
  { id: "high", label: "Rigorous", description: "Academic-level", icon: ShieldAlert },
];
