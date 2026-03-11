import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import { COMPANY_ENRICHMENT_TYPE } from "../../constants/types";

const COMPANY_ENRICHMENT_V2_TYPE = COMPANY_ENRICHMENT_TYPE;

export const COMPANY_ENRICHMENT_V2_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1762770191674/icon-company-enrichment%20%281%29.svg",
  name: "Company Enrichment",
  type: COMPANY_ENRICHMENT_V2_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#3B82F6",
  foreground: "#fff",
  dark: "#2563eb",
  light: "#3B82F6",
  hasTestModule: true,
  canSkipTest: true,
  isRecord: true,
  credits: 10,
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: COMPANY_ENRICHMENT_V2_NODE.dark,
  activeTabBg: COMPANY_ENRICHMENT_V2_NODE.dark,
  activeTabText: "#ffffff",
  accentColor: COMPANY_ENRICHMENT_V2_NODE.light,
};

export const CONFIGURE_FIELDS = [
  {
    key: "domain",
    name: "Domain",
    label: "Select domain identifier",
    placeholder: "Enter company domain identifier",
    type: "fx",
    required: true,
    description:
      "The company domain or website URL is the most effective identifier for company data enhancement.",
  },
];

export const COMPANY_TEMPLATES = [
  {
    id: "from-domain",
    name: "From Domain",
    description: "Enrich company data using their website domain",
    icon: "Globe",
    defaults: {
      domain: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
];

export const getCompanyTemplateById = (id) => {
  return COMPANY_TEMPLATES.find((t) => t.id === id) || null;
};

export { COMPANY_ENRICHMENT_V2_TYPE };
