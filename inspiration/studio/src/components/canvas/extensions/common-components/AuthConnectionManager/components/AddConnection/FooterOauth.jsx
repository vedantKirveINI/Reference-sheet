import { useCallback, useEffect, useState } from "react";
import classes from "./index.module.css";
// import { ODSButton } from "@src/module/ods";
import { getOAuth2UrlFromConfig, getStateId, shouldRenderDialog,  } from "./utils";
// import { serverConfig } from "@src/module/ods";
import { ODSButton, serverConfig } from "@src/module/ods";
import { toast } from "sonner";
import { getConfigObjectByKey } from "../../utils";
const FooterOauth = ({
  setShowAddConnection,
  authorization,
  name,
  parentId,
  projectId,
  workspaceId,
  onConnectionAddSuccessfully = () => {},
  setShowAuthForm,
}) => {
  const [authorizedData, setAuthorizedData] = useState(null);
  const [checkPopupClosedIntervalID, setCheckPopupClosedIntervalID] =
    useState(null);
  const [loading, setLoading] = useState(false);

  const handleCheckPopupConsentWindowClosedInterval = useCallback(
    (popupWindow) => {
      const checkPopupClosedInterval = setInterval(() => {
        if (!popupWindow || !popupWindow?.window) {
          clearInterval(checkPopupClosedInterval);

          if (authorizedData) return;

          setAuthorizedData({
            status: "failure",
            message: "Failed to verify connection. Status Code Error: 400",
            isCompleted: false,
          });

          setLoading(false);
        }
      }, 3000);

      setCheckPopupClosedIntervalID(checkPopupClosedInterval);
    },
    [
      authorizedData,
      setAuthorizedData,
      setLoading,
      setCheckPopupClosedIntervalID,
    ]
  );

  const handeOnConnectionAdd = useCallback(async () => {
    if (shouldRenderDialog(authorization?.authorization_type)) {
      setShowAuthForm(true);
      return;
    }

    const { authUrl, code_verifier } = await getOAuth2UrlFromConfig(
      authorization?.configs
    );

    if (!authUrl) {
      toast.error("Configuration Error", {
        description: "Missing required configuration",
      });
      return;
    }

    const appType = getConfigObjectByKey(authorization?.configs, "app_type");

    const authState = {
      name,
      authorization_id: authorization?.authorization_id,
      user_token: window.accessToken,
      parent_window_url: window.location.origin,
      parent_id: parentId,
      project_id: projectId,
      auth_parent_id: authorization?.authorization?.parent_id,
      workspace_id: workspaceId,
      app_type: appType,
      code_verifier,
    };

    try {
      const stateID = await getStateId(authState);
      const oauth2Endpoint = `${authUrl}&state=${stateID}`;

      const popupConsentWindow = window.open(
        oauth2Endpoint,
        "Testing",
        "width=1200,height=800,top=0,left=0"
      );

      handleCheckPopupConsentWindowClosedInterval(popupConsentWindow);
    } catch (error) {
      toast.error("OAuth Error", {
        description: error.message || "Oops! Something went wrong while saving state",
      });
    }
  }, [
    name,
    authorization?.authorization_type,
    authorization?.configs,
    authorization?.authorization_id,
    authorization?.authorization?.parent_id,
    parentId,
    projectId,
    workspaceId,
    // loadAuthType,
    handleCheckPopupConsentWindowClosedInterval,
  ]);

  useEffect(() => {
    // Listen for messages from the popup window
    const receiveMessage = async (event) => {
      // Ensure that the message is coming from the opened window
      if (event.origin !== serverConfig.OAUTH2_REDIRECT_URI) return;

      const receivedMessage = event.data;

      if (receivedMessage?.status === "success") {
        onConnectionAddSuccessfully();
      } else {
        toast.error("OAuth Error", {
          description:
            receivedMessage?.message ||
            "Oops! Something went wrong. Please contact support.",
        });
      }

      setAuthorizedData(receivedMessage);
      if (checkPopupClosedIntervalID) {
        setCheckPopupClosedIntervalID(null);
      }
    };

    window.addEventListener("message", receiveMessage);

    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, [checkPopupClosedIntervalID, onConnectionAddSuccessfully]);

  return (
    <div className={classes["footer-container"]}>
      <ODSButton
        label="DISCARD"
        variant="black-text"
        onClick={() => {
          setShowAddConnection(false);
        }}
        // data-testid="add-connection-button"
        style={{
          fontFamily: "Inter",
          fontSize: "1em",
          fontStyle: "normal",
          fontWeight: 600,
          padding: "1.3em 1em",
        }}
      />
      <ODSButton
        label="ADD CONNECTION"
        variant="black"
        onClick={handeOnConnectionAdd}
        // data-testid="add-connection-button"
        style={{
          fontFamily: "Inter",
          fontSize: "1em",
          fontStyle: "normal",
          fontWeight: 600,
          padding: "1.3em 1em",
        }}
        disabled={!name}
      />
    </div>
  );
};

export default FooterOauth;
