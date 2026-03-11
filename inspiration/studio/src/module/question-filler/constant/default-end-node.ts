import { QuestionType } from "@src/module/constants";
import { serverConfig } from '@src/module/ods';

const DEFAULT_END_NODE_KEY = "OUTE_END_NODE";

export const DEFAULT_END_NODE_VALUE = {
  inputs: [],
  outputs: [],
  type: QuestionType.ENDING,
  config: {
    question: "You rock! We've got your submission!",
    description: "Thanks for filling out the form",
    type: QuestionType.ENDING,
    buttonLabel: "Create your own form",
    settings: {
      questionAlignment: "center",
      socialShareIcons: false,
      submitAnotherResponse: false,
      redirectURL:
        `${process.env.REACT_APP_TINYCOMMAND_URL}/` ||
        "https://www.tinycommand.com/",
      promotionalText:
        "Create your own form—it's simple, stunning, and completely free!",
      brandText: "Made with ♥ on Tinycommand",
    },
    output: {},
  },
  id: DEFAULT_END_NODE_KEY,
  _id: DEFAULT_END_NODE_KEY,
  prev_node_ids: [],
  next_node_ids: [],
  node_marker: "END",
};
