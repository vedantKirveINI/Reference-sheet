import extensionIcons from "../../assets/extensions";
import { TINY_GPT_LEARNING_TYPE } from "../constants/types";
import { NODE_TEMPLATES } from "../../templates/nodeTemplates";

const TINYGPT_LEARNING_NODE = {
  _src: extensionIcons.tinyGptLearning,
  name: "Tiny GPT Learning",
  description: "",
  type: TINY_GPT_LEARNING_TYPE,
  template: NODE_TEMPLATES.CIRCLE,
  background: "linear-gradient(180.4deg, #6200EE 27.7%, #A676EA 100%)", //"#be63f9",
  foreground: "#fff",
  dark: "#6200EE",
  light: "#A676EA",
};

export const ASSESSMENT_FREQUENCY_SETTINGS = {
  OPTION_ONE: "Option One",
  OPTION_TWO: "Option Two",
};

export const CONTENT_DEPTH_SPECIFICATION = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  EXPERT: "Expert",
};

export const LEARNING_STYLE = {
  VISUAL: "Visual",
  AUDITORY: "Auditory",
  KINESTHETIC: "Kinesthetic",
};

export const PACING_OPTIONS = {
  SELF_PACED: "Self-Paced",
  GUIDED: "Guided",
};

export default TINYGPT_LEARNING_NODE;
