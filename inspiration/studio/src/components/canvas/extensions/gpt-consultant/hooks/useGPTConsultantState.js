import { useGPTState } from "../../gpt-common";
import { CONSULTANT_TEMPLATES } from "../constants";

export const useGPTConsultantState = (initialData = {}) => {
  return useGPTState(initialData, CONSULTANT_TEMPLATES);
};

export default useGPTConsultantState;
