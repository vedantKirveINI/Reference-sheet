import extensionIcons from "../../../assets/extensions";
import { DELETE_SHEET_RECORD_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";

const DELETE_SHEET_RECORD_NODE = {
  cmsId: "delete-sheet-record",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1744179450009/DeleteSheetRecord.svg",
  name: "Delete Record",
  description: "",
  type: DELETE_SHEET_RECORD_TYPE,
  template: NODE_TEMPLATES.CIRCLE, // GOJS default key for template
  background:
    "var(--Sheet-Grad, linear-gradient(180deg, #399B6B 3.83%, #47C486 100%))",
  foreground: "#fff",
  dark: "#399B6B",
  light: "#47C486",
  hasTestModule: true,
  canSkipTest: true,
  isRecord: true,
};

export default DELETE_SHEET_RECORD_NODE;
