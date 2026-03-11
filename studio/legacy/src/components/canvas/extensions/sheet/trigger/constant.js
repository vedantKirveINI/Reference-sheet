import { SHEET_TRIGGER } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates";

const SHEET_TRIGGER_NODE = {
  cmsId: "sheet-trigger",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1756107568290/Table_trigger.svg",
  name: "Table Trigger",
  description: "",
  hoverDescription:
    "Starts when activity or updates occur in any selected table you use.",
  type: SHEET_TRIGGER,
  template: NODE_TEMPLATES.CIRCLE, // GOJS default key for template
  background:
    "var(--Sheet-Grad, linear-gradient(180deg, #399B6B 3.83%, #47C486 100%))",
  foreground: "#fff",
  dark: "#399B6B",
  light: "#47C486",
  hasTestModule: false,
  canSkipTest: true,
  denyFromLink: true,
};

export default SHEET_TRIGGER_NODE;
