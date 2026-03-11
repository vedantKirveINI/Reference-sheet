import { CREATE_SHEET_RECORD_TYPE_V2 } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";

const CREATE_SHEET_RECORD_NODE = {
  cmsId: "create-sheet-record",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1744179540585/CreateSheetRecord.svg",
  name: "Create Record",
  description: "",
  type: CREATE_SHEET_RECORD_TYPE_V2,
  template: NODE_TEMPLATES.CIRCLE, // GOJS default key for template
  background: "linear-gradient(180.4deg, #036F08 27.7%, #78EB7C 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#036F08",
  light: "#78EB7C",
  hasTestModule: true,
  canSkipTest: true,
  isRecord: true,
};

export default CREATE_SHEET_RECORD_NODE;
