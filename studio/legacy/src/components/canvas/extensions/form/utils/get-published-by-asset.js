// import { showAlert } from "oute-ds-alert";
import { showAlert } from "@src/module/ods";
import { canvasSDKServices } from "../../../services/canvasSDKServices";

export const getPublishedByAssets = async (formId) => {
  if (!formId) {
    showAlert({ type: "error", message: "Form ID is not present" });
    return;
  }

  const response = await canvasSDKServices.getPublishedByAsset({
    asset_id: formId,
    include_project_variable: true,
  });

  return response?.result;
};
