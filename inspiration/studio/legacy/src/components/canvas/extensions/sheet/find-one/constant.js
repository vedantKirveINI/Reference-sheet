
import { FIND_ONE_SHEET_RECORD_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";

const FIND_ONE_SHEET_RECORD_NODE = {
  _src: "https://cdn-v1.tinycommand.com/1234567890/1744179221297/FindOneSheetRecord.svg",
  name: "Find One Record (deprecated)",
  description: "",
  type: FIND_ONE_SHEET_RECORD_TYPE,
  template: NODE_TEMPLATES.CIRCLE, // GOJS default key for template
  background:
    "var(--Sheet-Grad, linear-gradient(180deg, #399B6B 3.83%, #47C486 100%))",
  foreground: "#fff",
  dark: "#399B6B",
  light: "#47C486",
  hasTestModule: true,
  canSkipTest: true,
  deprecated: true,
};

export default FIND_ONE_SHEET_RECORD_NODE;
