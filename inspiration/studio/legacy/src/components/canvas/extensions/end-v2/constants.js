import extensionIcons from "../../assets/extensions";
import { SUCCESS_SETUP_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const END_NODE_V2 = {
  cmsId: "end",
  _src: extensionIcons.endIcon,
  name: "End Node",
  description: "",
  type: SUCCESS_SETUP_TYPE,
  template: NODE_TEMPLATES.END,
  background: "linear-gradient(180.4deg, #455A64 27.7%, #8BB6CA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#455A64",
  light: "#8BB6CA",
  hasTestModule: false,
  canSkipTest: true,
  denyToLink: true,
  noConfigRequired: true,
};

export default END_NODE_V2;
