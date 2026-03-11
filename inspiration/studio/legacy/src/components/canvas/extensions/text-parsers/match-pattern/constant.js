import { MATCH_PATTERN_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";

const MATCH_PATTERN_NODE = {
  cmsId: "match-pattern",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742550293954/matchpattern.svg",
  name: "Match Pattern",
  description: "",
  type: MATCH_PATTERN_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(196deg, #00457D 2.15%, #4AA3EB 77.96%)",
  dark: "#00457D",
  light: "#4AA3EB",
  foreground: "#fff",
};

export default MATCH_PATTERN_NODE;
