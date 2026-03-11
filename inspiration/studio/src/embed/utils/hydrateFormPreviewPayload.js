import _ from "lodash";
import { QuestionType, DEFAULT_QUESTION_CONFIG } from "@/module/constants";
import componentSDKServices from "@/sdk-services/component-sdk-services";

/**
 * Map UI/backend node type strings to QuestionType for default go_data lookup.
 * AI and some backends use WELCOME_SCREEN; app uses WELCOME.
 */
const UI_TYPE_TO_QUESTION_TYPE = {
  WELCOME_SCREEN: QuestionType.WELCOME,
  WELCOME: QuestionType.WELCOME,
  THANK_YOU_SCREEN: QuestionType.ENDING,
  ENDING: QuestionType.ENDING,
  [QuestionType.SHORT_TEXT]: QuestionType.SHORT_TEXT,
  [QuestionType.LONG_TEXT]: QuestionType.LONG_TEXT,
  [QuestionType.MCQ]: QuestionType.MCQ,
  [QuestionType.SCQ]: QuestionType.SCQ,
  [QuestionType.EMAIL]: QuestionType.EMAIL,
  [QuestionType.PHONE_NUMBER]: QuestionType.PHONE_NUMBER,
  [QuestionType.DATE]: QuestionType.DATE,
  [QuestionType.YES_NO]: QuestionType.YES_NO,
  [QuestionType.RANKING]: QuestionType.RANKING,
  [QuestionType.DROP_DOWN]: QuestionType.DROP_DOWN,
  [QuestionType.DROP_DOWN_STATIC]: QuestionType.DROP_DOWN_STATIC,
  [QuestionType.QUOTE]: QuestionType.QUOTE,
  [QuestionType.LOADING]: QuestionType.LOADING,
  [QuestionType.NUMBER]: QuestionType.NUMBER,
  [QuestionType.CURRENCY]: QuestionType.CURRENCY,
  [QuestionType.SIGNATURE]: QuestionType.SIGNATURE,
  [QuestionType.FILE_PICKER]: QuestionType.FILE_PICKER,
  [QuestionType.TIME]: QuestionType.TIME,
  [QuestionType.ADDRESS]: QuestionType.ADDRESS,
  [QuestionType.TEXT_PREVIEW]: QuestionType.TEXT_PREVIEW,
  [QuestionType.AUTOCOMPLETE]: QuestionType.AUTOCOMPLETE,
  [QuestionType.MULTI_QUESTION_PAGE]: QuestionType.MULTI_QUESTION_PAGE,
  [QuestionType.QUESTIONS_GRID]: QuestionType.QUESTIONS_GRID,
  [QuestionType.PICTURE]: QuestionType.PICTURE,
  [QuestionType.QUESTION_REPEATER]: QuestionType.QUESTION_REPEATER,
  [QuestionType.RATING]: QuestionType.RATING,
  [QuestionType.SLIDER]: QuestionType.SLIDER,
  [QuestionType.OPINION_SCALE]: QuestionType.OPINION_SCALE,
  [QuestionType.TERMS_OF_USE]: QuestionType.TERMS_OF_USE,
};

/**
 * Build default go_data for a node type, with question/title from node text.
 * @param {string} nodeType - Raw type from node (e.g. WELCOME_SCREEN)
 * @param {object} node - Canvas node { key, text, name, type, ... }
 * @returns {object|null} go_data to pass to transformNode, or null if no default
 */
function buildGoDataForNode(nodeType, node) {
  const questionType = UI_TYPE_TO_QUESTION_TYPE[nodeType] || nodeType;
  const defaultSetup = DEFAULT_QUESTION_CONFIG[questionType];
  if (!defaultSetup) {
    return null;
  }
  const questionText =
    node?.text ?? node?.name ?? node?.go_data?.question ?? defaultSetup?.question ?? "";
  return {
    ..._.cloneDeep(defaultSetup),
    question: questionText || (defaultSetup?.question ?? ""),
    type: questionType,
    _id: defaultSetup?._id ?? `node-${node?.key}`,
  };
}

/**
 * Build minimal synthetic tf_data so the form preview flow can include the node
 * when transformNode fails (e.g. 401 in embed).
 */
function buildSyntheticTfData(node) {
  const nodeKey = node?.key ?? "";
  const name = node?.text ?? node?.name ?? node?.type ?? "Step";
  const nodeType = node?.type ?? "";
  const serverType = UI_TYPE_TO_QUESTION_TYPE[nodeType] || nodeType;
  return {
    id: nodeKey.toString(),
    _id: nodeKey.toString(),
    config: {
      name,
      settings: {},
    },
    type: serverType,
  };
}

/**
 * Hydrate form preview payload: for each node missing tf_data/go_data,
 * build go_data from defaults, call transformNode, and patch the node with
 * tf_data (or synthetic tf_data on failure).
 * @param {object} basePayload - { _r: modelJSON, name, ... }
 * @returns {Promise<object>} Payload with _r.nodeDataArray patched (cloned, not mutated)
 */
export async function hydrateFormPreviewPayload(basePayload) {
  if (!basePayload?._r) {
    return basePayload;
  }
  const model = _.isObject(basePayload._r) ? basePayload._r : JSON.parse(basePayload._r || "{}");
  const nodeDataArray = model?.nodeDataArray ?? [];
  if (nodeDataArray.length === 0) {
    return basePayload;
  }

  const clonedModel = _.cloneDeep(model);
  const clonedNodes = clonedModel.nodeDataArray;
  const canvasJson = JSON.stringify(clonedModel);

  for (let i = 0; i < clonedNodes.length; i++) {
    const node = clonedNodes[i];
    const hasTfData = !_.isEmpty(node?.tf_data);
    const hasGoData = !_.isEmpty(node?.go_data);
    if (hasTfData && hasGoData) {
      continue;
    }

    const nodeType = node?.type ?? "";
    const goData = buildGoDataForNode(nodeType, node);
    if (!goData) {
      const questionTypeForDefault = UI_TYPE_TO_QUESTION_TYPE[nodeType] || nodeType;
      if (!hasTfData && !hasGoData && DEFAULT_QUESTION_CONFIG[questionTypeForDefault]) {
        clonedNodes[i].tf_data = buildSyntheticTfData(node);
        clonedNodes[i].go_data = { question: node?.text ?? node?.name ?? "", type: questionTypeForDefault };
      }
      continue;
    }

    let response;
    try {
      response = await componentSDKServices.transformNode(
        canvasJson,
        node.key,
        { ...goData, last_updated: Date.now() }
      );
    } catch {
      response = undefined;
    }

    if (response?.status === "success" && response?.result?.tf_data) {
      clonedNodes[i].tf_data = response.result.tf_data;
      clonedNodes[i].go_data = {
        ...goData,
        ...(response.result.tf_output && { output: response.result.tf_output }),
        last_updated: Date.now(),
      };
    } else {
      clonedNodes[i].tf_data = buildSyntheticTfData(node);
      clonedNodes[i].go_data = { ...goData, last_updated: Date.now() };
    }
  }

  return {
    ...basePayload,
    _r: clonedModel,
  };
}
