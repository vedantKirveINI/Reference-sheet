import { FIND_ONE_SHEET_RECORD_V2_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
import { SHEET_ERRORS } from "../../../utils/errorEnums";

const FIND_ONE_SHEET_RECORD_NODE_V2 = {
  cmsId: "find-one-sheet-record",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1744179221297/FindOneSheetRecord.svg",
  name: "Find One Record",
  description: "",
  type: FIND_ONE_SHEET_RECORD_V2_TYPE,
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

const ERROR_TABS_MAPPING = {
  0: [
    SHEET_ERRORS.SHEET_MISSING,
    SHEET_ERRORS.TABLE_MISSING,
    SHEET_ERRORS.VIEW_MISSING,
  ],
  1: [SHEET_ERRORS.SELECT_MIN_ONE_COLUMN],
};

export default FIND_ONE_SHEET_RECORD_NODE_V2;
export { ERROR_TABS_MAPPING };
