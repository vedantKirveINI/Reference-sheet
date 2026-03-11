import { SHEET_DATE_FIELD_TRIGGER } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates";

const DATE_FIELD_TRIGGER_NODE = {
  cmsId: "date-field-trigger",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1756107568290/Table_trigger.svg",
  name: "Date Field Trigger",
  description: "",
  hoverDescription:
    "Starts when a date in a table field approaches or passes (before, on, or after the date).",
  type: SHEET_DATE_FIELD_TRIGGER,
  template: NODE_TEMPLATES.CIRCLE,
  background:
    "var(--Sheet-Grad, linear-gradient(180deg, #399B6B 3.83%, #47C486 100%))",
  foreground: "#fff",
  dark: "#399B6B",
  light: "#47C486",
  hasTestModule: false,
  canSkipTest: true,
  denyFromLink: true,
};

export default DATE_FIELD_TRIGGER_NODE;
