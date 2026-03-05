import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import { EMAIL_ENRICHMENT_TYPE } from "../../constants/types";

const EMAIL_ENRICHMENT_V2_TYPE = EMAIL_ENRICHMENT_TYPE;

export const EMAIL_ENRICHMENT_V2_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1762770194308/icon-email-enrichment%20%281%29.svg",
  name: "Email Enrichment",
  type: EMAIL_ENRICHMENT_V2_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#22C55E",
  foreground: "#fff",
  dark: "#16a34a",
  light: "#22C55E",
  hasTestModule: true,
  canSkipTest: true,
  isRecord: true,
  credits: 5,
};

export const TABS = {
  INITIALISE: "initialise",
  CONFIGURE: "configure",
  TEST: "test",
};

export const THEME = {
  headerBg: "#ffffff",
  primaryButtonBg: EMAIL_ENRICHMENT_V2_NODE.dark,
  activeTabBg: EMAIL_ENRICHMENT_V2_NODE.dark,
  activeTabText: "#ffffff",
  accentColor: EMAIL_ENRICHMENT_V2_NODE.light,
};

export const CONFIGURE_FIELDS = [
  {
    key: "domain",
    name: "Domain",
    label: "Company domain identifier",
    placeholder: "Enter company domain identifier",
    type: "fx",
    required: true,
    description:
      "The company domain is required to identify the organization and improve email accuracy.",
  },
  {
    key: "fullName",
    name: "Full Name",
    label: "Person's full name",
    placeholder: "Enter person's full name",
    type: "fx",
    required: true,
    description:
      "The person's full name is required to generate accurate email addresses.",
  },
];

export const EMAIL_TEMPLATES = [
  {
    id: "find-email",
    name: "Find Email",
    description: "Find email address for a person at a company",
    icon: "Search",
    defaults: {
      domain: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      fullName: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
];

export const getEmailTemplateById = (id) => {
  return EMAIL_TEMPLATES.find((t) => t.id === id) || null;
};

export { EMAIL_ENRICHMENT_V2_TYPE };
