import extensionIcons from "../../assets/extensions";
import { TINY_GPT_CREATIVE_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TINYGPT_CREATIVE_NODE = {
  _src: extensionIcons.tinyGptCreative,
  name: "Tiny GPT Creative",
  description: "",
  type: TINY_GPT_CREATIVE_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6200EE 27.7%, #A676EA 100%)",
  foreground: "#fff",
  dark: "#6200EE",
  light: "#A676EA",
};

export const CONTENT_TYPE = {
  AD_COPY: "Ad Copy",
  BRAND_NAME: "Brand Name",
  SLOGAN: "Slogan",
};

export const CREATIVITY_LEVEL_ADJUSTMENT = {
  CONSERVATIVE: "Conservative",
  BALANCED: "Balanced",
  HIGHLY_CREATIVE: "Highly Creative",
};

export const FORMAT_SELECTION = {
  TEXT: "Text",
  VISUAL_STORYBOARD: "Visual Storyboard",
};

export default TINYGPT_CREATIVE_NODE;
