import { canvasSDKServices } from "../../../services/canvasSDKServices";
import { toast } from "sonner";

export const getPublishedByAssets = async (formId) => {
  console.log("[getPublishedByAssets] Called with formId:", {
    formId,
    formIdLength: formId?.length,
    formIdFormat: formId ? (formId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ? "UUID" : "non-UUID") : "missing",
  });
  
  if (!formId) {
    console.error("[getPublishedByAssets] Form ID is not present");
    toast.error("Validation Error", {
      description: "Form ID is not present",
    });
    return;
  }

  try {
    const response = await canvasSDKServices.getPublishedByAsset({
      asset_id: formId,
      include_project_variable: true,
    });

    console.log("[getPublishedByAssets] API response:", {
      formId,
      responseStatus: response?.status,
      resultId: response?.result?._id || response?.result?.id,
      resultTitle: response?.result?.title || response?.result?.name,
      hasFlow: !!response?.result?.flow,
      flowKeys: response?.result?.flow ? Object.keys(response?.result.flow) : [],
      hasMeta: !!response?.result?.meta,
      metaThumbnail: response?.result?.meta?.thumbnail ? `${response.result.meta.thumbnail.substring(0, 50)}...` : "none",
    });

    return response?.result;
  } catch (error) {
    console.error("[getPublishedByAssets] API error:", {
      formId,
      error: error?.message,
      errorStack: error?.stack,
      errorResponse: error?.response?.data || error?.response,
    });
    throw error;
  }
};
