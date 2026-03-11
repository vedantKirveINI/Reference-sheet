import { useGPTState } from "../../gpt-common";
import { LEARNING_TEMPLATES } from "../constants";

export const useGPTLearningState = (initialData = {}) => {
  return useGPTState(initialData, LEARNING_TEMPLATES);
};

export default useGPTLearningState;
