import { NODE_TEMPLATES } from "../components/canvas/templates";
import { HITL_TYPE } from "../components/canvas/extensions";
import componentSDKServices from "../sdk-services/component-sdk-services";
import { getChildNodeLocation } from "../pages/ic-canvas/utils/canvas-utils";

export const useUpdateHITLNode = (canvasRef) => {
  const updateHITLData = (fromNode, toNode, newNode, link) => {
    const linkData = link.data;
    let fromData = fromNode.data;
    const data = newNode.data;
    try {
      if (
        (linkData.isOnResponseLink || linkData.isInitiateLink) &&
        fromData.type !== HITL_TYPE
      ) {
        throw new Error("Issue in link's from node.");
      }

      if (linkData.isOnResponseLink) {
        fromData.go_data.on_response_node_id = data.key;
      } else if (linkData.isInitiateLink) {
        fromData.go_data.initiate_node_id = data.key;
      }

      const last_updated = Date.now();
      componentSDKServices
        .transformNode(canvasRef.current?.getModelJSON(), fromData.key, {
          ...(fromData?.go_data || {}),
          last_updated,
        })
        .then((response) => {
          if (response?.status === "success") {
            canvasRef.current?.createNode(
              {
                ...fromData,
                tf_data: response.result.tf_data,
                go_data: {
                  ...(fromData?.go_data || {}),
                  output: response.result.tf_output,
                  last_updated,
                },
              },
              {
                openNodeAfterCreate: false,
              }
            );
          }
        });
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const postSaveHandlerForHITLNode = (node) => {
    const existingLinks = canvasRef.current?.findLinksOutOf(node?.key);
    const go_data = node.data?.go_data;
    let responseLinkData,
      initiateLinkData = null;
    existingLinks.each((link) => {
      const data = link?.data;
      if (data.isOnResponseLink) {
        responseLinkData = data;
      } else if (data.isInitiateLink) {
        initiateLinkData = data;
      }
    });
    let response_node_id = go_data.on_response_node_id || responseLinkData?.to;
    let initiate_node_id = go_data.initiate_node_id || initiateLinkData?.to;
    if (!response_node_id) {
      const placeholder = canvasRef.current?.createNode(
        {
          template: NODE_TEMPLATES.PLACEHOLDER,
        },
        {
          location: getChildNodeLocation(node.location, 2, 0),
        }
      );
      response_node_id = placeholder?.data?.key;
    }
    if (!initiate_node_id) {
      const placeholder = canvasRef.current?.createNode(
        {
          template: NODE_TEMPLATES.PLACEHOLDER,
        },
        {
          location: getChildNodeLocation(node.location, 2, 1),
        }
      );
      initiate_node_id = placeholder?.data?.key;
    }
    if (responseLinkData) {
      canvasRef.current?.updateLink({
        linkData: responseLinkData,
        linkKeyToUpdate: "to",
        linkKeyToUpdateValue: response_node_id,
      });
    } else {
      canvasRef.current?.createLink({
        from: node?.data?.key,
        to: response_node_id,
        label: "On Review Response",
        key: Date.now(),
        isOnResponseLink: true,
      });
    }

    if (initiateLinkData) {
      canvasRef.current?.updateLink({
        linkData: initiateLinkData,
        linkKeyToUpdate: "to",
        linkKeyToUpdateValue: initiate_node_id,
      });
    } else {
      canvasRef.current?.createLink({
        from: node?.data?.key,
        to: initiate_node_id,
        label: "Notify Reviewer On",
        key: Date.now() + 100,
        isInitiateLink: true, //initiate link
      });
    }
  };

  return {
    updateHITLData,
    postSaveHandlerForHITLNode,
  };
};
