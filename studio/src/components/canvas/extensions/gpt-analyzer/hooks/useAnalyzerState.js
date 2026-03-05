import { useGPTState } from "../../gpt-common";
import { ANALYZER_TEMPLATES } from "../constants";

export const useAnalyzerState = (initialData = {}) => {
  return useGPTState(initialData, ANALYZER_TEMPLATES);
};

export default useAnalyzerState;
