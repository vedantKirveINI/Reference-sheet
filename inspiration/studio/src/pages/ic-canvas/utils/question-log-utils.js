import { QUESTIONS_NODES } from "../../../components/canvas/extensions";
import dayjs from "dayjs";
import _ from "lodash";
import { removeTagsFromString } from "../../../module/constants";

const getTime = () => {
  return dayjs().format("DD-MM-YYYY | HH:mm:ss");
};

const formatMessage = (response, node) => {
  const questionTypes = Object.keys(QUESTIONS_NODES);
  let label = questionTypes?.includes(node?.type)
    ? node?.config?.question || node?.question
    : node?.config?.label;
  label = removeTagsFromString(label);
  return `${node?.type} - ${label}: ${
    _.isString(response) ? response : JSON.stringify(response || {}, null, 2)
  }`;
};

export const formatDataForQuestionEventLog = (data) => {
  const responseType = typeof data?.response;

  if (responseType === "object") {
    return [
      {
        created_at: getTime(),
        message: formatMessage("", data?.node),
        type: data?.type,
      },
      {
        created_at: getTime(),
        message: data?.response || {},
        messageType: "json",
        type: data?.type,
      },
    ];
  } else {
    return [
      {
        created_at: getTime(),
        message: formatMessage(data?.response, data?.node),
        type: data?.type,
      },
    ];
  }
};
