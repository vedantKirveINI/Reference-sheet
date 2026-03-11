import { useContext } from "react";
import FormPublishContext from "../context/form-publish-context";

export const useFormPublishContext = () => {
  const context = useContext(FormPublishContext);
  if (!context) {
    throw new Error(
      "useFormPublishContext must be used within a FormPublishProvider",
    );
  }
  return context;
};
