import { TNode } from "../types";
import { canvasSDKServices } from "../services/canvasSDKServices";
import { toast } from "sonner";

export const getStartNode = (allNodes = {}): TNode => {
  const response = canvasSDKServices.getStartNodeOfPublishedCanvas({
    flow: allNodes,
  });

  if (!response?.result) {
    toast.error("Canvas Error", {
      description: "The canvas does not have a start node",
    });
  }
  return response?.result;
};
