import React, { useEffect, useState, useCallback } from "react";
import { ODSAutocomplete, ODSTextField, ODSCircularProgress } from "@src/module/ods";
import { toast } from "sonner";
import NameDialog from "./components/name-dialog";
import PlusIcon from "./icons/plus-icon";
import { connectionStyles } from "./styles";
import { AUTH_TYPES } from "@src/module";
import authorizeDataSDKServices from "./services/authorize-data-sdk-services";
import { getToken } from "./services/base-config";
import FormDialog from "./components/form";
import { getFormID } from "./utils/getFormID";
import { shouldRenderDialog } from "./utils/shouldRenderDialog";
import { ViewPort } from "@oute/oute-ds.core.constants";
import { serverConfig } from "@src/module/ods";
import { executeNode } from "./utils/executeNode";
import { getOAuth2UrlFromConfig } from "./utils/getOAuth2UrlFromConfig";
import { getInputsData } from "./utils/getInputsData";
import { getStateId } from "./utils/getStateID";
export type ConnectionProps = {
  question: any;
  value: any;
  onChange: (value: any) => void;
  disabled: boolean;
  node?: any;
  resourceIds?: Record<string, any>;
  isCreator: boolean;
  viewPort?: string;
};

interface IAuthorizeDataData {
  status: "success" | "failure";
  message: string;
  isCompleted: boolean;
}

export function Connection({
  question,
  disabled,
  onChange,
  value,
  isCreator,
  node,
  resourceIds = {},
  viewPort = ViewPort.DESKTOP,
}: ConnectionProps) {
  const [loading, setLoading] = useState(true);
  const [userConnections, setUserConnections] = useState([]);
  const [authorizedData, setAuthorizedData] =
    useState<IAuthorizeDataData | null>(null);
  const [checkPopupClosedIntervalID, setCheckPopupClosedIntervalID] =
    React.useState(null);
  const [showFormDialog, setShowFormDialog] = useState<boolean>(false);
  const [showNameDialog, setShowNameDialog] = useState<boolean>(false);
  const [connectionName, setConnectionName] = useState<string>("");

  const fetchData = useCallback(async () => {
    if (isCreator) {
      setUserConnections([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const auths = await authorizeDataSDKServices.getByParent({
        parent_id: resourceIds?.projectId,
        authorization_id: question?.authorization_id || "",
        workspace_id: resourceIds?.workspaceId,
      });

      if (auths?.result?.length) {
        setUserConnections(auths?.result);
        return auths?.result;
      }
    } catch (error) {
      throw new Error(error);
    } finally {
      setLoading(false);
    }
  }, [
    isCreator,
    resourceIds?.projectId,
    resourceIds?.workspaceId,
    question?.authorization_id,
  ]);

  const handleCheckPopupConsentWindowClosedInterval = (popupWindow: Window) => {
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
  };

  const onClickAddNewConnection = async () => {
    if (shouldRenderDialog(question?.authorization_type)) {
      setShowFormDialog(true);
      return;
    }

    const URL = getOAuth2UrlFromConfig(question?.configs);

    if (!URL) {
      toast.error("Configuration Error", {
        description: "Missing required configuration",
      });
      return;
    }

    const authState = {
      name: connectionName,
      authorization_id: question?.authorization_id,
      user_token: getToken(),
      parent_window_url: window.location.origin,
      parent_id: resourceIds?.parentId,
      project_id: resourceIds?.projectId,
      auth_parent_id: question?.authorization?.parent_id,
      workspace_id: resourceIds?.workspaceId,
    };

    try {
      const stateID = await getStateId(authState);
      const oauth2Endpoint = `${URL}&state=${stateID}`;

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
  };

  const onNewConnectionAdd = async () => {
    const auths = await fetchData();
    const latestAuth = auths[auths?.length - 1];
    const inputs = getInputsData(
      node?.inputs,
      resourceIds?.projectId,
      resourceIds?.parentId,
      resourceIds?.workspaceId
    );
    onChange({
      ...(latestAuth?.configs || {}),
      ...(inputs || {}),
      name: latestAuth?.name,
      _id: latestAuth?._id,
    });
    toast.success("Authorized Successfully!");
  };
  React.useEffect(() => {
    // Listen for messages from the popup window
    const receiveMessage = async (event: MessageEvent<unknown>) => {
      // Ensure that the message is coming from the opened window
      if (event.origin !== serverConfig.OAUTH2_REDIRECT_URI) return;

      const receivedMessage = event.data as IAuthorizeDataData;

      if (receivedMessage?.status === "success") {
        onNewConnectionAdd();
      } else {
        toast.error("OAuth Error", {
          description: receivedMessage?.message || "Oops! Something went wrong.",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  useEffect(() => {
    const authorizationType = question?.authorization?.auth_type;
    const hasRefreshToken = value?.refresh_token;

    if (
      !value ||
      !hasRefreshToken ||
      authorizationType !== AUTH_TYPES.OAUTH2_AUTHORIZATION_CODE ||
      disabled
    )
      return;

    const fetchUpdatedValues = async () => {
      const updatedValue = await executeNode({
        node,
        value,
        parent_id: resourceIds?.parentId,
        project_id: resourceIds?.projectId,
        workspace_id: resourceIds?.workspaceId,
        asset_id: resourceIds?.assetId,
        _id: resourceIds?._id,
        canvasId: resourceIds?.canvasId,
      });
      onChange(updatedValue);
    };
    fetchUpdatedValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div style={connectionStyles.container} data-testid="connection-root">
        <ODSAutocomplete
          id="connection-autocomplete"
          data-testid="connection-autocomplete"
          
          disabled={disabled}
          value={value || null}
          onChange={async (e, newValue) => {
            const updatedValue = await executeNode({
              node,
              value: {
                ...newValue.configs,
                name: newValue?.name,
                _id: newValue?._id,
              },
              parent_id: resourceIds?.parentId,
              project_id: resourceIds?.projectId,
              workspace_id: resourceIds?.workspaceId,
              asset_id: resourceIds?.assetId,
              _id: resourceIds?._id,
              canvasId: resourceIds?.canvasId,
            });
            onChange(updatedValue);
          }}
          isOptionEqualToValue={(option, _value) => option._id === _value._id}
          getOptionLabel={(option) => option.name || ""}
          options={userConnections}
          loading={loading}
          renderOption={(props, option) => {
            return (
              <li {...props} key={option?._id}>
                {option?.name}
              </li>
            );
          }}
          renderInput={(params) => (
            <ODSTextField
              {...params}
              data-testid="connection-input"
              placeholder="User connection"
              style={{
                padding: "0.15em",
                fontSize: "1.15em",
                borderRadius: "0.75em",
                border: "0.75px solid rgba(0, 0, 0, 0.2)",
              }}
              InputProps={{
                ...params.InputProps,
                // startAdornment: (
                //   <>
                //     <img
                //       src={SlackImage}
                //       alt="SlackImage"
                //       style={connectionStyles.imageStyles}
                //     />
                //   </>
                // ),
                endAdornment: (
                  <>
                    {loading ? (
                      <ODSCircularProgress color="inherit" size={20} />
                    ) : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />
        <button
          type="button"
          style={connectionStyles.button(disabled)}
          onClick={() => setShowNameDialog(true)}
          disabled={disabled}
          data-testid="connection-add-button"
        >
          {loading ? (
            <ODSCircularProgress
              color="inherit"
              size={20}
              data-testid="connection-progress-icon"
            />
          ) : (
            <PlusIcon
              fill={disabled ? "#607D8B" : "#fff"}
              data-testid="connection-add-icon"
            />
          )}
          <span style={connectionStyles.buttonText}>ADD</span>
        </button>
      </div>
      {showNameDialog && (
        <NameDialog
          open={showNameDialog}
          onDiscard={() => setShowNameDialog(false)}
          onNextClick={() => {
            onClickAddNewConnection();
            setShowNameDialog(false);
          }}
          viewPort={viewPort}
          connectionName={connectionName}
          setConnectionName={setConnectionName}
        />
      )}
      {showFormDialog && (
        <FormDialog
          open={showFormDialog}
          onClose={() => setShowFormDialog(false)}
          formId={getFormID(question)}
          parentId={resourceIds?.parentId}
          projectId={resourceIds?.projectId}
          workspaceId={resourceIds?.workspaceId}
          question={question}
          viewPort={viewPort}
          connectionName={connectionName}
          onNewConnectionAdd={onNewConnectionAdd}
          setConnectionName={setConnectionName}
        />
      )}
    </>
  );
}
