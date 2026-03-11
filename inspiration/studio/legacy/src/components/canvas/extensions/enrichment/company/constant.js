import { COMPANY_ENRICHMENT_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";

const COMPANY_ENRICHMENT_NODE = {
  cmsId: "company-enrichment",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1762770191674/icon-company-enrichment%20%281%29.svg",
  name: "Company Enrichment",
  description: "",
  type: COMPANY_ENRICHMENT_TYPE,
  template: NODE_TEMPLATES.CIRCLE, // GOJS default key for template
  background: "linear-gradient(135deg, #8133F1 0%, #360083 100%)",
  foreground: "#fff",
  dark: "#360083",
  light: "#8133F1",
  hasTestModule: true,
  canSkipTest: true,
  isRecord: true,
  credits: 10,
};

export default COMPANY_ENRICHMENT_NODE;
