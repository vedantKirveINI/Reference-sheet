import { removeTagsFromString } from "@oute/oute-ds.core.constants";
import { serverConfig } from '@src/module/ods';
import Prompt from "oute-services-prompt-sdk";

const params = {
    url: serverConfig.CONTENT_API_SERVER,
    token: window.accessToken,
};

const getPromptInstance = () => {
    return new Prompt(params);
}

const promptServices = {
    prompt: async (questionTitle) => {
        try {
            const body = {
                prompt_id: process.env.REACT_APP_CONTENT_API_PROMPT_ID,
                state: {
                    text: removeTagsFromString(questionTitle),
                },
                generate_type: "Text",
            };
            const response = await getPromptInstance().execute(body)
            return response;

        } catch (error) {
        }
    }
}

export default promptServices;

