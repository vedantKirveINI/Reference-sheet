import utility from "oute-services-utility-sdk";
import { BODY_TYPES, AUTH_TYPES, CONTENT_TYPE_HEADER, RAW_TYPES, FORM_DATA_ROW_TYPE_FILE } from "./constants";
import { generateUUID } from "@/lib/utils";
import { convertJsonToFields } from "@src/module/input-grid-v3/input-grid/utils";

export const createFxValue = (text = "") => ({
  type: "fx",
  blocks: text ? [{ type: "PRIMITIVES", value: text }] : [],
  text: text || "",
});

export const createKeyValueRow = (key, value) => ({
  key,
  value: createFxValue(value),
  valueStr: value,
  rowid: generateUUID(),
  expand: false,
});

export const createFormDataFileRow = (key = "") => ({
  key,
  value: "",
  valueStr: "",
  type: FORM_DATA_ROW_TYPE_FILE,
  fileData: null,
  rowid: generateUUID(),
  expand: false,
});

const buildRawJsonBody = (bodyData) => {
  const bodyString =
    typeof bodyData === "string"
      ? bodyData
      : JSON.stringify(bodyData, null, 2);
  let parsed = null;
  try {
    parsed = JSON.parse(bodyString);
  } catch {
    parsed = null;
  }
  if (parsed !== null && typeof parsed === "object") {
    const gridArray = convertJsonToFields(parsed, true);
    return {
      type: BODY_TYPES.RAW,
      data: gridArray,
      sub_type: "json",
      jsonInputMode: "grid",
      jsonGridData: gridArray,
      jsonFxData: createFxValue(bodyString),
    };
  }
  return {
    type: BODY_TYPES.RAW,
    data: createFxValue(bodyString),
    sub_type: "json",
  };
};

export const parseCurlCommand = async (curlCommand) => {
  if (!curlCommand || !curlCommand.trim()) {
    throw new Error("Please enter a cURL command");
  }


  let trimmed = curlCommand.trim();

  trimmed = trimmed.replace(/\\(["\\$`])/g, '$1');

  if (!trimmed.toLowerCase().startsWith("curl")) {
    throw new Error("Invalid cURL command. Must start with 'curl'");
  }

  try {
    const parsed = utility.curlToJson(trimmed);
    if (!parsed || !parsed.url) {
      throw new Error("Could not parse URL from cURL command");
    }

    const result = {
      method: (parsed.method || "GET").toUpperCase(),
      url: createFxValue(parsed.url),
      headers: [],
      query_params: [],
      body: { type: BODY_TYPES.NONE, data: null, sub_type: null },
      authorization: { type: AUTH_TYPES.NONE, data: null },
    };

    if (parsed.headers && typeof parsed.headers === "object") {
      result.headers = Object.entries(parsed.headers).map(([key, value]) =>
        createKeyValueRow(key, String(value))
      );
    }

    if (parsed.query_params && typeof parsed.query_params === "object") {
      result.query_params = Object.entries(parsed.query_params).map(([key, value]) =>
        createKeyValueRow(key, String(value))
      );
    }

    if (parsed.body || parsed.data) {
      const bodyData = parsed.body || parsed.data;
      const bodyInfoType = parsed.body_info?.type?.toLowerCase();

      if (bodyInfoType === "form-data") {
        result.body = {
          type: BODY_TYPES.FORM_DATA,
          data:
            typeof bodyData === "object"
              ? Object.entries(bodyData).map(([k, v]) =>
                  createKeyValueRow(k, String(v))
                )
              : [],
        };
      } else if (bodyInfoType === "x-www-form-urlencoded") {
        result.body = { type: BODY_TYPES.URL_ENCODED, data: [] };
        if (typeof bodyData === "string") {
          const params = new URLSearchParams(bodyData);
          result.body.data = Array.from(params.entries()).map(([key, value]) =>
            createKeyValueRow(key, value)
          );
        } else if (typeof bodyData === "object") {
          result.body.data = Object.entries(bodyData).map(([key, value]) =>
            createKeyValueRow(key, String(value))
          );
        }
      } else if (bodyInfoType === "raw") {
        const subTypeRaw = parsed.body_info?.sub_type?.toLowerCase();
        const rawSubType = RAW_TYPES.some((t) => t.id === subTypeRaw)
          ? subTypeRaw
          : "json";
        if (rawSubType === "json") {
          result.body = buildRawJsonBody(bodyData);
        } else {
          result.body = {
            type: BODY_TYPES.RAW,
            data: createFxValue(
              typeof bodyData === "string"
                ? bodyData
                : JSON.stringify(bodyData, null, 2)
            ),
            sub_type: rawSubType,
          };
        }
      } else {
        const contentTypeHeader = result.headers.find(
          (h) => h.key.toLowerCase() === CONTENT_TYPE_HEADER.toLowerCase()
        );
        const contentType = contentTypeHeader?.valueStr || "";

        if (contentType.includes("application/json")) {
          result.body = buildRawJsonBody(bodyData);
        } else if (contentType.includes("application/x-www-form-urlencoded")) {
          result.body = {
            type: BODY_TYPES.URL_ENCODED,
            data: [],
          };
          if (typeof bodyData === "string") {
            const params = new URLSearchParams(bodyData);
            result.body.data = Array.from(params.entries()).map(
              ([key, value]) => createKeyValueRow(key, value)
            );
          } else if (typeof bodyData === "object") {
            result.body.data = Object.entries(bodyData).map(([key, value]) =>
              createKeyValueRow(key, String(value))
            );
          }
        } else if (contentType.includes("multipart/form-data")) {
          result.body = {
            type: BODY_TYPES.FORM_DATA,
            data:
              typeof bodyData === "object"
                ? Object.entries(bodyData).map(([key, value]) =>
                    createKeyValueRow(key, String(value))
                  )
                : [],
          };
        } else {
          result.body = {
            type: BODY_TYPES.RAW,
            data: createFxValue(String(bodyData)),
            sub_type: "text",
          };
        }
      }
    }

    if (parsed.url.includes("?")) {
      const [baseUrl, queryString] = parsed.url.split("?");
      result.url = createFxValue(baseUrl);
      const params = new URLSearchParams(queryString);
      result.query_params = [
        ...result.query_params,
        ...Array.from(params.entries()).map(([key, value]) =>
          createKeyValueRow(key, value)
        ),
      ];
    }

    return result;
  } catch (error) {
    throw new Error("Failed to parse cURL command. Please check the format.", {
      cause: error,
    });
  }
};

export const isCurlCommand = (input) => {
  return /^\s*curl\s+/i.test(input);
};

export const getContentTypeForBodyType = (bodyType, rawType) => {
  switch (bodyType) {
    case BODY_TYPES.FORM_DATA:
      return "multipart/form-data";
    case BODY_TYPES.URL_ENCODED:
      return "application/x-www-form-urlencoded";
    case BODY_TYPES.RAW:
      const normalizedRawType = rawType ? String(rawType).toLowerCase() : "json";
      const rawTypeConfig = RAW_TYPES.find((t) => t.id === normalizedRawType);
      return rawTypeConfig?.contentType || "application/json";
    case BODY_TYPES.BINARY:
      return "application/octet-stream";
    default:
      return null;
  }
};

export const getStatusColor = (status) => {
  if (status >= 200 && status < 300) return "bg-emerald-100 text-emerald-700";
  if (status >= 300 && status < 400) return "bg-yellow-100 text-yellow-700";
  if (status >= 400 && status < 500) return "bg-orange-100 text-orange-700";
  if (status >= 500) return "bg-red-100 text-red-700";
  return "bg-gray-100 text-gray-700";
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};
