import * as go from "gojs";
import { linkTemplate } from "./linkTemplate";
import { LINK_STROKE } from "../constants";

export const LINK_TEMPLATES = {
  LINK: "",
};

const linkTemplates = [{ key: LINK_TEMPLATES.LINK, template: linkTemplate }];

export const getLinkTemplates = (mode) => {
  const map = new go.Map();

  for (const link of linkTemplates) {
    const linkShape = linkTemplate?.findObject("LINKSHAPE");
    const linkArrow = linkTemplate?.findObject("LINKARROW");
    if (linkShape && linkArrow) {
      linkShape.stroke = LINK_STROKE;
      linkArrow.stroke = LINK_STROKE;
    }
    map.add(link.key, link.template);
  }

  return map;
};
