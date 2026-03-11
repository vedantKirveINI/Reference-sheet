import { QuestionType } from "../../../module/constants";
import _ from "lodash";
import axios from "axios";
// import { serverConfig } from "oute-ds-utils";
import { serverConfig } from "@src/module/ods";

export const ACCESS_TOKEN = window.accessToken;

const BASE_URL = serverConfig.SHEET_SERVER;

/**
 * Generates the payload for fields based on node data array containing independent question types.
 *
 * @param {Array} nodeDataArray - An array of node data to extract fields from.
 * @return {Array} The payload containing fields extracted from the node data array.
 */

const questionNodesWithDefaultValueHasFx = [
  QuestionType.SHORT_TEXT,
  QuestionType.LONG_TEXT,
  QuestionType.NUMBER,
  QuestionType.EMAIL,
];
const getFieldsPayload = (nodeDataArray = [], mappedSheetData = []) => {
  let fields_payload = [];

  const hashedNodeDataArray = _.keyBy(nodeDataArray, "key");

  mappedSheetData?.forEach((data) => {
    const nodeDetails = hashedNodeDataArray[data?.value];
    if (
      questionNodesWithDefaultValueHasFx.includes(data?.type) &&
      nodeDetails?.settings?.hasOwnProperty("defaultValue")
    ) {
      delete nodeDetails?.settings?.defaultValue;
    }

    let options = nodeDetails?.options;

    // Added to remove older node other option 21/Moy
    if (
      nodeDetails?.type === QuestionType.MCQ ||
      nodeDetails?.type === QuestionType.SCQ
    ) {
      const hasOther = nodeDetails?.settings?.other;
      const lastOption = options?.[options.length - 1]?.toLowerCase();
      options =
        hasOther && lastOption !== "other" ? [...options, "Other"] : options;
    }

    if (
      nodeDetails?.type === QuestionType.DROP_DOWN_STATIC &&
      nodeDetails?.settings?.includeOtherOption
    ) {
      options = [...options, "Other"];
    }

    fields_payload.push({
      name: data?.name,
      type: data?.type,
      node_id: [data?.value],
      options: {
        ...nodeDetails?.settings,
        options: options,
      },
    });
  });

  // nodeDataArray.forEach((data) => {
  //   const go_data = data?.go_data;

  //   const INDEPENDENT_QUESTIONS_TYPE = Object.values(QuestionType);
  //   if (INDEPENDENT_QUESTIONS_TYPE.includes(go_data?.type)) {
  //     if (
  //       go_data?.type === QuestionType.WELCOME ||
  //       go_data?.type === QuestionType.ENDING ||
  //       go_data?.type === QuestionType.QUOTE
  //     )
  //       return;
  //     fields_payload.push({
  //       name: removeTagsFromString(go_data?.question),
  //       type: go_data?.type || "",
  //       node_id: data?.key,
  //       options: getSettings({ go_data }) || {},
  //     });
  //   }
  // });

  return fields_payload;
};

const getSettings = ({ go_data }) => {
  let questionType = go_data?.type;
  const questionsWithOptions = [
    QuestionType.MCQ,
    QuestionType.SCQ,
    QuestionType.DROP_DOWN,
  ];
  if (questionsWithOptions.includes(questionType)) {
    return { ...go_data?.settings, options: go_data?.options };
  }
  return go_data?.settings;
};

/**
 * Generates the payload for updating a sheet based on sheet asset details and node data array.
 *
 * @param {Object} sheetAssetDetails - The details of the sheet asset including base, table, and view IDs.
 * @param {Array} nodeDataArray - An array of node data containing information for updating the sheet.
 * @return {Object} The payload for updating the sheet.
 */
const getUpdateSheetPayload = (
  sheetAssetDetails = {},
  nodeDataArray = [],
  mappedSheetData = []
) => {
  let payload = {
    baseId: sheetAssetDetails?.base?.id,
    tableId: sheetAssetDetails?.table?.id,
    viewId: sheetAssetDetails?.view?.id,
  };

  const hashedNodeDataArray = _.keyBy(nodeDataArray, "key");

  let fields_payload = [];

  mappedSheetData.forEach((data) => {
    const nodeDetails = hashedNodeDataArray[data?.value];
    const shouldIncludeQuestionOptions =
      nodeDetails?.type === QuestionType.DROP_DOWN_STATIC ||
      nodeDetails?.type === QuestionType.MCQ ||
      nodeDetails?.type === QuestionType.SCQ ||
      nodeDetails?.type === QuestionType.RANKING;

    const field_payload = {
      name: data?.name,
      type: data?.type,
      node_id: [data?.value],
      id: data?.id,
      options: {
        ...nodeDetails?.settings,
      },
    };

    if (shouldIncludeQuestionOptions) {
      // Added to remove older node other option 21/Moy
      let options = nodeDetails?.options;
      if (
        nodeDetails?.type === QuestionType.MCQ ||
        nodeDetails?.type === QuestionType.SCQ
      ) {
        const hasOther = nodeDetails?.settings?.other;
        const lastOption = options?.[options.length - 1]?.toLowerCase();
        options =
          hasOther && lastOption !== "other" ? [...options, "Other"] : options;
      }
      if (
        nodeDetails?.type === QuestionType.DROP_DOWN_STATIC &&
        nodeDetails?.settings?.includeOtherOption
      ) {
        options = [...options, "Other"];
      }
      field_payload.options.options = options;
    }

    fields_payload.push(field_payload);
  });

  // nodeDataArray.forEach((data) => {
  //   const go_data = data?.go_data;
  //   const INDEPENDENT_QUESTIONS_TYPE = Object.values(QuestionType);
  //   if (INDEPENDENT_QUESTIONS_TYPE.includes(go_data?.type)) {
  //     if (
  //       go_data?.type === QuestionType.WELCOME ||
  //       go_data?.type === QuestionType.ENDING ||
  //       go_data?.type === QuestionType.QUOTE
  //     )
  //       return;

  //     fields_payload.push({
  //       name: removeTagsFromString(go_data?.question),
  //       type: go_data?.type || "",
  //       node_id: data?.key,
  //       id: sheetAssetDetails?.fields?.find(
  //         (field) => field?.nodeId === data?.key,
  //       )?.id,
  //       options: getSettings({ go_data }) || {},
  //     });
  //   }
  // });

  return {
    ...payload,
    fields_payload: fields_payload,
  };
};

export const createSheetByNodeDataArray = async ({
  parent_id,
  workspace_id,
  access_token = ACCESS_TOKEN,
  nodeDataArray = [],
  form_name,
  mappedSheetData,
}) => {
  try {
    if (!(workspace_id && access_token)) {
      throw "Error while creating sheet";
    }

    const fields_payload = getFieldsPayload(nodeDataArray, mappedSheetData);
    const response = await axios.post(
      `${BASE_URL}/sheet/create_form_sheet`,
      {
        parent_id: _.isEmpty(parent_id) ? undefined : parent_id,
        workspace_id,
        access_token,
        fields_payload,
        form_name: `${form_name} (Responses)`,
      },
      {
        headers: {
          "Content-Type": "application/json",
          token: access_token,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating sheet:", error);
    return {
      error: true,
      message: error?.response?.data?.message || error?.message,
    };
  }
};

export const updateSheetByNodeDataArray = async ({
  sheetAssetDetails,
  nodeDataArray = [],
  access_token,
  mappedSheetData,
}) => {
  const payload = getUpdateSheetPayload(
    sheetAssetDetails,
    nodeDataArray,
    mappedSheetData
  );
  try {
    const response = await axios.post(
      `${BASE_URL}/sheet/update_form_sheet`,
      {
        ...payload,
      },
      {
        headers: {
          "Content-Type": "application/json",
          token: access_token,
        },
      }
    );
    //getting previous sheet details and just updating the fields came from request response
    const responseData = {
      ...sheetAssetDetails,
      fields: [...(response.data?.fields_payload || [])],
    };
    return responseData;
  } catch (error) {
    console.error("Error creating sheet:", error);
    return {
      error: true,
      message: error?.response?.data?.message,
    };
  }
};

export const handleSheetsFlow = async ({
  parent_id,
  workspace_id,
  mappedSheetData,
  access_token = ACCESS_TOKEN,
  sheetAssetDetails,
  nodeDataArray = [],
  form_name = "New Form",
}) => {
  if (sheetAssetDetails?.table?.baseId && sheetAssetDetails?.table?.id) {
    return updateSheetByNodeDataArray({
      sheetAssetDetails,
      nodeDataArray,
      access_token,
      mappedSheetData,
    });
  } else {
    return createSheetByNodeDataArray({
      parent_id: parent_id,
      workspace_id: workspace_id,
      access_token: access_token,
      nodeDataArray,
      form_name,
      mappedSheetData,
    });
  }
};
