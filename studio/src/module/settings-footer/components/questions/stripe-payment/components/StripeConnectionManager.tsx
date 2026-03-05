import React, { useCallback, useEffect, useState } from "react";
import { ODSButton, ODSIcon, ODSLabel, ODSRadioGroup, ODSSkeleton, ODSRadio, ODSTextField, serverConfig } from "@src/module/ods";
import { toast } from "sonner";
import dayjs from "dayjs";
import { authorizeDataSDKServices } from "@oute/oute-ds.common.core.utils/services";
const PARENT_ID = process.env.REACT_APP_STRIPE_PAYMENT_PARENT_ID;
const AUTHORIZATION_ID = process.env.REACT_APP_STRIPE_PAYMENT_AUTHORIZATION_ID;

const getConfigObjectByKey = (configs: any[], key: string) => {
  if (!configs || !key) return null;
  const config = configs.find((c) => c?.key === key);
  return config?.value || null;
};

const base64UrlEncode = (buffer: Uint8Array) => {
  return btoa(String.fromCharCode.apply(null, Array.from(buffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const generateCodeVerifier = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
};

const generateCodeChallenge = async (codeVerifier: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(digest);
  return base64UrlEncode(hashArray);
};

const getOAuth2UrlFromConfig = async (configs: any[] = []) => {
  let oAuthEndPointConfig: any;
  let client_id: any;
  let redirect_uri: any;
  let scope: any;
  let user_scope: any;
  let response_type: any;
  let access_type: any;
  let prompt: any;
  let allow_pkce: any;

  for (const config of configs) {
    switch (config.key) {
      case "authorization_uri":
        oAuthEndPointConfig = config;
        break;
      case "client_id":
        client_id = config;
        break;
      case "redirect_uri":
        redirect_uri = config;
        break;
      case "scope":
        scope = config;
        break;
      case "user_scope":
        user_scope = config;
        break;
      case "response_type":
        response_type = config;
        break;
      case "access_type":
        access_type = config;
        break;
      case "prompt":
        prompt = config;
        break;
      case "allow_pkce":
        allow_pkce = config;
        break;
    }
  }

  if (!oAuthEndPointConfig || !client_id || !redirect_uri || !response_type) {
    return { authUrl: "", code_verifier: "" };
  }

  const isAllowPkce = allow_pkce?.value === "Yes";
  const code_verifier = isAllowPkce ? generateCodeVerifier() : "";
  const code_challenge = isAllowPkce
    ? await generateCodeChallenge(code_verifier)
    : "";

  const authUrl = `${oAuthEndPointConfig.value}?client_id=${
    client_id.value
  }&redirect_uri=${redirect_uri.value}&response_type=${
    response_type.value
  }${scope?.value ? "&scope=" + scope.value : ""}${
    user_scope?.value ? "&user_scope=" + user_scope.value : ""
  }${access_type?.value ? "&access_type=" + access_type.value : ""}${
    prompt?.value ? "&prompt=" + prompt.value : ""
  }${
    code_verifier
      ? "&code_challenge=" + code_challenge + "&code_challenge_method=S256"
      : ""
  }`;

  return { authUrl, code_verifier };
};

const getStateId = async (authorizationState: any) => {
  const response = await fetch(
    `${process.env.REACT_APP_OUTE_SERVER}/service/v0/temp/storage/save`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: window.accessToken,
      },
      body: JSON.stringify({
        meta: authorizationState,
      }),
    }
  );

  const responseData = await response.json();
  if (responseData.status !== "success") {
    throw new Error(
      responseData?.result?.message || "Failed to save authorization state"
    );
  }

  return responseData?.result?._id;
};

const getAuthorization = async () => {
  const response = await fetch(
    `${process.env.REACT_APP_OUTE_SERVER}/service/v0/authorization/by/parent?parent_id=${PARENT_ID}&state=ACTIVE`,
    {
      method: "GET",
      headers: {
        token: window.accessToken,
      },
    }
  );
  const data = await response.json();
  if (data?.status === "success" && data?.result) {
    const auths = Array.isArray(data.result) ? data.result : [data.result];
    return (
      auths.find(
        (auth: any) =>
          auth._id === AUTHORIZATION_ID ||
          auth.authorization_id === AUTHORIZATION_ID
      ) || auths[0]
    );
  }
  return null;
};

const getConnections = async (workspaceId: string) => {
  try {
    const response = await authorizeDataSDKServices.getByParent({
      authorization_id: AUTHORIZATION_ID,
      workspace_id: workspaceId,
    });

    if (response?.status === "success" && response?.result?.length) {
      return response.result.sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    return [];
  } catch (error: any) {
    return [];
  }
};

type StripeConnectionManagerProps = {
  workspaceId: string;
  projectId?: string;
  parentId?: string;
  selectedConnectionId?: string;
  onConnectionChange: (connection: any) => void;
  onConnectionDelete: (connectionId: string) => void;
};

const StripeConnectionManager = ({
  workspaceId,
  projectId,
  parentId,
  selectedConnectionId,
  onConnectionChange,
  onConnectionDelete,
}: StripeConnectionManagerProps) => {
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<any[]>([]);
  const [authorization, setAuthorization] = useState<any>(null);
  const [showAddConnection, setShowAddConnection] = useState(false);
  const [connectionName, setConnectionName] = useState("");
  const [addConnectionLoading, setAddConnectionLoading] = useState(false);
  const [checkPopupClosedIntervalID, setCheckPopupClosedIntervalID] =
    useState<any>(null);
  const [authorizedData, setAuthorizedData] = useState<any>(null);

  const fetchAuthorization = useCallback(async () => {
    const auth = await getAuthorization();
    setAuthorization(auth);
    return auth;
  }, []);

  const fetchConnections = useCallback(async () => {
    setLoading(true);
    const conns = await getConnections(workspaceId);
    setConnections(conns);
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    const initialize = async () => {
      await fetchAuthorization();
      await fetchConnections();
    };
    initialize();
  }, [fetchAuthorization, fetchConnections]);

  const handleCheckPopupConsentWindowClosedInterval = useCallback(
    (popupWindow: Window | null) => {
      const checkPopupClosedInterval = setInterval(() => {
        if (!popupWindow || !popupWindow?.window) {
          clearInterval(checkPopupClosedInterval);
          if (authorizedData) return;
          setAuthorizedData({
            status: "failure",
            message: "Failed to verify connection. Status Code Error: 400",
            isCompleted: false,
          });
          setAddConnectionLoading(false);
        }
      }, 3000);
      setCheckPopupClosedIntervalID(checkPopupClosedInterval);
    },
    [authorizedData]
  );

  const handleAddConnection = useCallback(async () => {
    if (!authorization?.configs) {
      toast.error("Configuration Error", {
        description: "Authorization configuration not loaded",
      });
      return;
    }

    if (!connectionName.trim()) {
      toast.error("Validation Error", {
        description: "Please enter a connection name",
      });
      return;
    }

    setAddConnectionLoading(true);

    try {
      const { authUrl, code_verifier } = await getOAuth2UrlFromConfig(
        authorization.configs
      );

      if (!authUrl) {
        toast.error("Configuration Error", {
          description: "Missing required configuration",
        });
        setAddConnectionLoading(false);
        return;
      }

      const appType = getConfigObjectByKey(authorization.configs, "app_type");

      const authState = {
        name: connectionName,
        authorization_id: authorization?._id || authorization?.id,
        user_token: window.accessToken,
        parent_window_url: window.location.origin,
        auth_parent_id: authorization.parent_id || PARENT_ID,
        workspace_id: workspaceId,
        app_type: appType,
        code_verifier,
      };

      const stateID = await getStateId(authState);
      const oauth2Endpoint = `${authUrl}&state=${stateID}`;

      const popupConsentWindow = window.open(
        oauth2Endpoint,
        "Stripe OAuth",
        "width=1200,height=800,top=0,left=0"
      );

      handleCheckPopupConsentWindowClosedInterval(popupConsentWindow);
    } catch (error: any) {
      toast.error("OAuth Error", {
        description: error.message || "Oops! Something went wrong",
      });
      setAddConnectionLoading(false);
    }
  }, [
    authorization?._id,
    authorization?.configs,
    authorization?.id,
    authorization?.parent_id,
    connectionName,
    handleCheckPopupConsentWindowClosedInterval,
    workspaceId,
  ]);

  useEffect(() => {
    const receiveMessage = async (event: MessageEvent) => {
      if (event.origin !== serverConfig.OAUTH2_REDIRECT_URI) return;

      const receivedMessage = event.data;

      if (receivedMessage?.status === "success") {
        await fetchConnections();
        const latestConn = await getConnections(workspaceId);
        if (latestConn.length > 0) {
          onConnectionChange(latestConn[0]);
        }
        toast.success("Connection added successfully!");
        setShowAddConnection(false);
        setConnectionName("");
      } else {
        toast.error("OAuth Error", {
          description:
            receivedMessage?.message ||
            "Oops! Something went wrong. Please contact support.",
        });
      }

      setAuthorizedData(receivedMessage);
      setAddConnectionLoading(false);
      if (checkPopupClosedIntervalID) {
        clearInterval(checkPopupClosedIntervalID);
        setCheckPopupClosedIntervalID(null);
      }
    };

    window.addEventListener("message", receiveMessage);
    return () => {
      window.removeEventListener("message", receiveMessage);
    };
  }, [
    checkPopupClosedIntervalID,
    fetchConnections,
    workspaceId,
    onConnectionChange,
  ]);

  const handleConnectionSelect = (connection: any) => {
    onConnectionChange(connection);
  };

  const handleDeleteConnection = useCallback(
    async (connectionId: string, e: React.MouseEvent<HTMLElement>) => {
      e.stopPropagation(); // Prevent radio button selection when clicking delete

      try {
        const response =
          await authorizeDataSDKServices.deleteById(connectionId);

        if (response?.status === "success") {
          toast.success("Connection deleted successfully!");

          // Remove connection from state
          setConnections((prevConnections) =>
            prevConnections.filter((conn) => conn._id !== connectionId)
          );

          // If the deleted connection was selected, clear the selection
          if (selectedConnectionId === connectionId) {
            onConnectionDelete(connectionId);
          }
        } else {
          toast.error("Delete Error", {
            description: response?.message || "Failed to delete connection",
          });
        }
      } catch (error: any) {
        toast.error("Delete Error", {
          description: error?.message || "Oops! Something went wrong",
        });
      }
    },
    [selectedConnectionId, onConnectionDelete]
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <ODSSkeleton
              variant="rounded"
              width="1.52681rem"
              height="2.25rem"
            />
            <ODSSkeleton variant="rounded" height="2.25rem" width="100%" />
            <ODSSkeleton variant="rounded" width="6.6875rem" height="2.25rem" />
          </div>
        ))}
      </div>
    );
  }

  if (showAddConnection) {
    return (
      <div className="flex flex-col gap-4">
        <ODSLabel variant="sub-heading-1">Connection Name</ODSLabel>
        <ODSTextField
          placeholder="Enter Connection name"
          fullWidth
          className="black"
          autoFocus
          
          value={connectionName}
          onChange={(e) => setConnectionName(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <ODSButton
            label="DISCARD"
            variant="black-text"
            onClick={() => {
              setShowAddConnection(false);
              setConnectionName("");
            }}
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
            onClick={handleAddConnection}
            disabled={!connectionName.trim() || addConnectionLoading}
            style={{
              fontFamily: "Inter",
              fontSize: "1em",
              fontStyle: "normal",
              fontWeight: 600,
              marginLeft: "0.5em",
              padding: "1.3em 1em",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ODSButton
        label="ADD CONNECTION"
        variant="black"
        onClick={() => setShowAddConnection(true)}
        startIcon={
          <ODSIcon
            outeIconName={"OUTEAddIcon"}
            outeIconProps={{
              sx: {
                color: "#fff",
              },
            }}
          />
        }
        style={{
          height: "2.75rem",
          fontFamily: "Inter",
          fontSize: "0.875rem",
          fontStyle: "normal",
          fontWeight: 600,
        }}
      />

      <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-[#cfd8dc]">
        <ODSLabel variant="sub-heading-1">Existing Connections</ODSLabel>
        <div className="flex flex-col gap-2">
          {connections.length > 0 ? (
            <ODSRadioGroup
              row={true}
              className="black"
              
              onChange={(e) => {
                const connection = connections.find(
                  (c) => c._id === e.target.value
                );
                if (connection) {
                  handleConnectionSelect(connection);
                }
              }}
            >
              {connections.map((connection) => (
                <StripeConnectionItem
                  key={connection._id}
                  connection={connection}
                  isSelected={selectedConnectionId === connection._id}
                  onDelete={handleDeleteConnection}
                />
              ))}
            </ODSRadioGroup>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 gap-4">
              <ODSIcon
                outeIconName={"OUTEConnectionIcon"}
                outeIconProps={{
                  sx: {
                    width: "3.04231rem",
                    height: "3.04231rem",
                    fill: "#607D8B",
                  },
                }}
              />
              <p className="text-[#607D8B] text-base m-0">
                No Connection available
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StripeConnectionItem = ({
  connection,
  isSelected,
  onDelete,
}: {
  connection: any;
  isSelected: boolean;
  onDelete: (connectionId: string, e: React.MouseEvent<HTMLElement>) => void;
}) => {
  const createdDate = dayjs(connection?.created_at).format("DD/MM/YYYY");

  return (
    <div
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 p-3 rounded-lg ${isSelected ? "border-2 border-[#212121] bg-[#f5f5f5]" : "border border-black/10 bg-white"}`}
    >
      <ODSRadio
        formControlLabelProps={{
          value: connection?._id,
          checked: isSelected,
          sx: {
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            "& .MuiRadio-root": {
              padding: "1px 9px",
              "&.Mui-checked": {
                color: "#212121",
              },
            },
            "& .MuiTypography-root": {
              display: "none",
            },
          },
        }}
      />
      <div className="w-full grid grid-cols-[1fr_auto] overflow-hidden items-center gap-4">
        <div
          className="w-full text-[#263238] text-[1.1em] overflow-hidden text-ellipsis whitespace-nowrap"
          title={connection?.name}
        >
          {connection?.name}
        </div>
        <div className="text-[#607D8B] text-[1.1em]">{createdDate}</div>
      </div>
      <ODSIcon
        outeIconName={"OUTETrashIcon"}
        onClick={(e) => onDelete(connection?._id || connection?.id, e)}
        outeIconProps={{
          sx: {
            cursor: "pointer",
            color: "#f44336",
            "&:hover": {
              color: "#d32f2f",
            },
            width: "1.5rem",
            height: "1.5rem",
          },
        }}
      />
    </div>
  );
};

export default StripeConnectionManager;
