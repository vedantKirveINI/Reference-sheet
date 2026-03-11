import { NODE_TEMPLATES } from "../../templates";
import { TINY_SEARCH } from "../constants/types";

const TINY_SEARCH_NODE = {
  cmsId: "tiny-search",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1757394192884/TinySearch.svg",
  name: "Tiny Search",
  description: "",
  type: TINY_SEARCH,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(135deg, #8133F1 0%, #360083 100%)",
  foreground: "#fff",
  dark: "#360083",
  light: "#8133F1",
  hasTestModule: true,
  credits: 10,
  //   canSkipTest: true,
};

export default TINY_SEARCH_NODE;
