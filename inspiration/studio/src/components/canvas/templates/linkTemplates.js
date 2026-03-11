import * as go from "gojs";
import { linkTemplate } from "./linkTemplate";
import { errorLinkTemplate } from "./errorLinkTemplate";
import { ERROR_LINK_STROKE, LINK_STROKE } from "../constants";

export const LINK_TEMPLATES = {
  LINK: "",
  ERROR_LINK: "errorLink",
};

const linkTemplates = [
  { key: LINK_TEMPLATES.LINK, template: linkTemplate },
  { key: LINK_TEMPLATES.ERROR_LINK, template: errorLinkTemplate },
];

export const getLinkTemplates = (mode) => {
  const map = new go.Map();

  for (const link of linkTemplates) {
    const linkShape = link.template?.findObject("LINKSHAPE");
    const linkArrow = link.template?.findObject("LINKARROW");
    if (linkShape && linkArrow) {
      const stroke =
        link.key === LINK_TEMPLATES.ERROR_LINK ? ERROR_LINK_STROKE : LINK_STROKE;
      linkShape.stroke = stroke;
      linkArrow.stroke = stroke;
    }
    map.add(link.key, link.template);
  }

  return map;
};
