// import HttpDialog from ".";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";
import { HTTP_TYPE } from "../constants/types";

const HTTP_NODE = {
  cmsId: "http",
  _src: "https://cdn-v1.tinycommand.com/1234567890/1742541365028/Http.svg",
  name: "HTTP",
  // description: "Method",
  type: HTTP_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(196deg, #7D007D 2.15%, #C800C8 77.96%)", //"#be63f9",
  foreground: "#fff",
  dark: "rgb(125, 0, 125)",
  light: "rgb(200, 0, 200)",
  hasTestModule: true,
  canSkipTest: false,
  premium: true,
  meta: {
    search_keys: [
      "Curl",
      "Postman",
      "Api",
      "Url",
      "Get",
      "Post",
      "Put",
      "Request",
    ],
  },
};

export default HTTP_NODE;

export const CONTENT_TYPE = "content-type";

export const FORM_DATA_CONTENT_TYPE = "multipart/form-data";

export const X_WWW_FORM_URLENCODED_CONTENT_TYPE =
  "application/x-www-form-urlencoded";
export const DEFAULT_BINARY_TYPE = "application/octet-stream";

export const PARAMS = "PARAMS";
export const HEADER = "HEADERS";
export const AUTH = "AUTHORIZATION";
export const BODY = "BODY";
