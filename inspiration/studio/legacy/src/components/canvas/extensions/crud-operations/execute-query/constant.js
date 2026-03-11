
import { EXECUTE_TYPE } from "../../constants/types";
import { NODE_TEMPLATES } from "../../../templates/nodeTemplates";
// import IfElseDialog from ".";

const EXECUTE_QUERY_NODE = {
  cmsId: "execute-query",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1741850796626/ExecuteRecord.svg",
  name: "Execute Query",
  description: "",
  type: EXECUTE_TYPE,
  template: NODE_TEMPLATES.CIRCLE, // GOJS default key for template
  // component: IfElseDialog,
  background: "#fff",
  foreground: "#000",
};

export default EXECUTE_QUERY_NODE;
