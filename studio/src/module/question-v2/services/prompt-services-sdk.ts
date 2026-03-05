import { removeTagsFromString } from "@oute/oute-ds.core.constants";
import Prompt from "oute-services-prompt-sdk";
import getSDKConfig from "./baseConfig";

const getPromptInstance = () => {
  return new Prompt(getSDKConfig());
};

export const promptServices = {
  prompt: async (questionTitle) => {
    try {
      const body = {
        prompt_id: process.env.REACT_APP_CONTENT_API_PROMPT_ID,
        state: {
          text: removeTagsFromString(questionTitle),
        },
        generate_type: "Text",
      };
      const response = await getPromptInstance().execute(body);
      return response;
    } catch (error) {
    }
  },
};
