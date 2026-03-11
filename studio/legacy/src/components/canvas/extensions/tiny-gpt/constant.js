import { TINY_GPT_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TINYGPT_NODE = {
  cmsId: "tiny-gpt",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1741763289265/TinyGPT.svg",
  name: "Tiny GPT",
  description: "",
  type: TINY_GPT_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6200EE 27.7%, #A676EA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#6200EE",
  light: "#A676EA",
  hasTestModule: true,
  canSkipTest: false,
  credits: 10,
  meta: {
    search_keys: ["Ai"],
  },
};

export default TINYGPT_NODE;
