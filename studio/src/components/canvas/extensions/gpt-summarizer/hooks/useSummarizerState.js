import { useGPTState } from "../../gpt-common";
import { SUMMARIZER_TEMPLATES } from "../constants";

export const useSummarizerState = (initialData = {}) => {
  return useGPTState(initialData, SUMMARIZER_TEMPLATES);
};

export default useSummarizerState;
