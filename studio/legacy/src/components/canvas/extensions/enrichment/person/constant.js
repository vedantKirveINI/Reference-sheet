import { PERSON_ENRICHMENT_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";

const PERSON_ENRICHMENT_NODE = {
  cmsId: "person-enrichment",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1762770196218/icon-person-enrichment%20%281%29.svg",
  name: "Person Enrichment",
  description: "",
  type: PERSON_ENRICHMENT_TYPE,
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

export default PERSON_ENRICHMENT_NODE;
