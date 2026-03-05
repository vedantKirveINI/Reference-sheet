import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import { PERSON_ENRICHMENT_TYPE } from "../../constants/types";

const PERSON_ENRICHMENT_V2_TYPE = PERSON_ENRICHMENT_TYPE;

export const PERSON_ENRICHMENT_V2_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1762770196218/icon-person-enrichment%20%281%29.svg",
  name: "Person Enrichment",
  type: PERSON_ENRICHMENT_V2_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "#8B5CF6",
  foreground: "#fff",
  dark: "#7c3aed",
  light: "#8B5CF6",
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
  primaryButtonBg: PERSON_ENRICHMENT_V2_NODE.dark,
  activeTabBg: PERSON_ENRICHMENT_V2_NODE.dark,
  activeTabText: "#ffffff",
  accentColor: PERSON_ENRICHMENT_V2_NODE.light,
};

export const CONFIGURE_FIELDS = [
  {
    key: "fullName",
    name: "Person's Full Name",
    label: "Person's full name",
    placeholder: "Enter person's full name",
    type: "fx",
    required: true,
    description:
      "The person's full name is required for accurate data enrichment.",
  },
  {
    key: "domain",
    name: "Company Domain",
    label: "Company domain identifier",
    placeholder: "Enter company domain identifier",
    type: "fx",
    required: true,
    description:
      "The company domain helps identify the person's workplace and improves search accuracy.",
  },
  {
    key: "linkedinUrl",
    name: "LinkedIn URL",
    label: "LinkedIn profile URL",
    placeholder: "Enter LinkedIn profile URL",
    type: "fx",
    required: false,
    description:
      "Optional LinkedIn profile URL for direct data extraction. If not provided, will search for profile information.",
  },
];

export const PERSON_TEMPLATES = [
  {
    id: "basic-enrichment",
    name: "Basic Enrichment",
    description: "Enrich person data using name and company domain",
    icon: "User",
    defaults: {
      fullName: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      domain: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      linkedinUrl: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
  {
    id: "linkedin-enrichment",
    name: "LinkedIn Enrichment",
    description: "Enrich with LinkedIn URL for more accurate data",
    icon: "Linkedin",
    defaults: {
      fullName: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      domain: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
      linkedinUrl: { type: "fx", blocks: [{ type: "PRIMITIVES", value: "" }] },
    },
  },
];

export const getPersonTemplateById = (id) => {
  return PERSON_TEMPLATES.find((t) => t.id === id) || null;
};

export { PERSON_ENRICHMENT_V2_TYPE };
