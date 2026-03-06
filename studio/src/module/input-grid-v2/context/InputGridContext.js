import { createContext, useContext } from "react";

export const defaultContextValue = {
  variables: {},
  readOnly: false,
  allowMapping: true,
  showFxCell: true,
  allowQuestionDataType: false,
};

export const InputGridContext = createContext(defaultContextValue);

export const useInputGridContext = () => useContext(InputGridContext);
