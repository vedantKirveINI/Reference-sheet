import { useCallback, useEffect, useRef, useState } from "react";
// @ts-expect-error Legacy ODS module
import { toast } from "sonner";
import { serverConfig } from "@/module/ods";

interface OAuthPopupConfig {
  authorization_id: string;
  authorization_type?: string;
  configs?: Record<string, any>[];
  authorization?: {
    parent_id?: string;
  };
}

interface ResourceIds {
  parentId?: string;
  projectId?: string;
  workspaceId?: string;
  assetId?: string;
  _id?: string;
}

interface UseLegacyOAuthPopupProps {
  authorizationConfig?: OAuthPopupConfig;
  resourceIds?: ResourceIds;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseLegacyOAuthPopupReturn {
  launchOAuthFlow: (connectionName: string) => Promise<void>;
  isLaunching: boolean;
}

async function getOAuth2UrlFromConfig(configs: Record<string, any>[] = []): Promise<{
  authUrl: string | null;
  code_verifier?: string;
}> {

  // Helper to find config value with multiple possible key names
  const getConfigValue = (...keys: string[]): any => {
    for (const key of keys) {
      const config = configs.find(
        (c) => c.key === key || c.name === key || 
               c.key?.toLowerCase() === key.toLowerCase() || 
               c.name?.toLowerCase() === key.toLowerCase()
      );
      const value = config?.value ?? config?.default;
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
    return undefined;
  };

  // Try multiple key variations for each OAuth parameter
  const oauth2_url = getConfigValue("oauth2_url", "oauth_url", "authUrl", "auth_url");
  const client_id = getConfigValue("client_id", "clientId", "client-id", "app_id", "appId");
  const scopes = getConfigValue("scopes", "scope", "oauth_scopes");
  const user_scope = getConfigValue("user_scope", "userScope");
  const authorize_uri = getConfigValue(
    "authorize_uri", "authorize_url", "authorization_url", "authorizationUrl",
    "auth_uri", "oauth_authorize_url", "authorization_uri"
  );
  const redirect_uri = getConfigValue("redirect_uri", "redirectUri", "redirect_url", "callback_url");
  const response_type = getConfigValue("response_type", "responseType") || "code";
  const access_type = getConfigValue("access_type", "accessType");
  const prompt = getConfigValue("prompt");
  const duration = getConfigValue("duration");
  const owner = getConfigValue("owner");
  const permissions = getConfigValue("permissions");
  const include_granted_scopes = getConfigValue("include_granted_scopes", "includeGrantedScopes");
  const disallow_webview = getConfigValue("disallow_webview", "disallowWebview");
  const allow_pkce = getConfigValue("allow_pkce", "allowPkce", "code_challenge_method", "codeChallengeMethod", "pkce_method");


  if (!client_id || !authorize_uri || !redirect_uri) {
    return { authUrl: null };
  }

  // Helper to get boolean-like config values
  const getBooleanValue = (value: any, defaultVal: string): string => {
    if (value === "Yes") return "true";
    if (value === "No") return "false";
    if (value === "None") return "";
    return defaultVal;
  };

  const include_granted_scopes_value = getBooleanValue(include_granted_scopes, "true");
  const disallow_webview_value = getBooleanValue(disallow_webview, "false");

  // Build auth URL - use redirect_uri from configs (critical for OAuth provider matching)
  // Note: Legacy implementation does NOT URL-encode parameter values - OAuth providers expect raw values
  let authUrl = `${authorize_uri}?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=${response_type}`;

  if (oauth2_url) {
    authUrl = oauth2_url;
  }

  if (scopes) {
    const scopeValue = Array.isArray(scopes) ? scopes.join(" ") : scopes;
    authUrl += `&scope=${scopeValue}`;
  }

  if (user_scope) {
    authUrl += `&user_scope=${user_scope}`;
  }

  if (access_type) {
    authUrl += `&access_type=${access_type}`;
  }

  if (include_granted_scopes_value) {
    authUrl += `&include_granted_scopes=${include_granted_scopes_value}`;
  }

  if (disallow_webview_value) {
    authUrl += `&disallow_webview=${disallow_webview_value}`;
  }

  if (prompt) {
    authUrl += `&prompt=${prompt}`;
  }

  if (duration) {
    authUrl += `&duration=${duration}`;
  }

  if (owner) {
    authUrl += `&owner=${owner}`;
  }

  if (permissions) {
    authUrl += `&permissions=${permissions}`;
  }

  let code_verifier: string | undefined;

  // Handle PKCE - legacy behavior: only enable when allow_pkce === "Yes"
  // Also support explicit code_challenge_method values ("S256" or "plain")
  const isPkceEnabled = allow_pkce === "Yes" || allow_pkce === "S256" || allow_pkce === "plain";
  
  if (isPkceEnabled) {
    const generateCodeVerifier = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return btoa(String.fromCharCode(...array))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    };

    const generateCodeChallengeS256 = async (verifier: string) => {
      const encoder = new TextEncoder();
      const data = encoder.encode(verifier);
      const digest = await crypto.subtle.digest("SHA-256", data);
      return btoa(String.fromCharCode(...new Uint8Array(digest)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    };

    code_verifier = generateCodeVerifier();
    
    // Determine the challenge method - default to S256, but support plain if explicitly set
    const challengeMethod = allow_pkce === "plain" ? "plain" : "S256";
    
    // For "plain" method, the challenge is the verifier itself (no hashing)
    // For "S256" method, the challenge is the SHA-256 hash of the verifier
    const code_challenge = challengeMethod === "plain" 
      ? code_verifier 
      : await generateCodeChallengeS256(code_verifier);
    
    authUrl += `&code_challenge=${code_challenge}&code_challenge_method=${challengeMethod}`;
  }

  return { authUrl, code_verifier };
}

async function getStateId(authState: Record<string, any>): Promise<string> {
  const response = await fetch(
    `${serverConfig.OUTE_SERVER}/service/v0/temp/storage/save`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: window.accessToken || "",
      },
      body: JSON.stringify({
        meta: authState,
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
}

export function useLegacyOAuthPopup({
  authorizationConfig,
  resourceIds = {},
  onSuccess,
  onError,
}: UseLegacyOAuthPopupProps): UseLegacyOAuthPopupReturn {
  const [isLaunching, setIsLaunching] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const popupWindowRef = useRef<Window | null>(null);
  const messageReceivedRef = useRef<boolean>(false);
  const popupOpenTimeRef = useRef<number>(0);
  const intervalCountRef = useRef<number>(0);
  
  // Use refs to store the latest callbacks to avoid stale closure issues
  // This ensures the interval/message handlers always call the current callbacks
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  // Keep refs in sync with props
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  const launchOAuthFlow = useCallback(
    async (connectionName: string): Promise<void> => {
      if (!authorizationConfig?.authorization_id) {
        const error = new Error("Missing authorization configuration");
        onError?.(error);
        toast.error("Missing authorization configuration. Please check extension setup.");
        return;
      }

      setIsLaunching(true);

      try {
        const { authUrl, code_verifier } = await getOAuth2UrlFromConfig(
          authorizationConfig.configs
        );

        if (!authUrl) {
          throw new Error("Missing required OAuth configuration (authorize_uri or client_id)");
        }

        const getConfigValue = (key: string): any => {
          const config = authorizationConfig.configs?.find(
            (c) => c.key === key || c.name === key
          );
          return config?.value ?? config?.default;
        };

        const appType = getConfigValue("app_type");

        // Use fallback values for parentId and projectId if they're undefined
        // Priority: explicit IDs > workspaceId > assetId > _id
        // workspaceId is often what the backend uses for authorization lookup
        const effectiveParentId = resourceIds.parentId || resourceIds.projectId || resourceIds.workspaceId || resourceIds.assetId || resourceIds._id;
        const effectiveProjectId = resourceIds.projectId || resourceIds.parentId || resourceIds.workspaceId || resourceIds.assetId || resourceIds._id;

        const authState = {
          name: connectionName,
          authorization_id: authorizationConfig.authorization_id,
          user_token: (window as any).accessToken,
          parent_window_url: window.location.origin,
          parent_id: effectiveParentId,
          project_id: effectiveProjectId,
          auth_parent_id: authorizationConfig.authorization?.parent_id,
          workspace_id: resourceIds.workspaceId,
          app_type: appType,
          code_verifier,
        };

        const stateId = await getStateId(authState);
        const oauth2Endpoint = `${authUrl}&state=${stateId}`;

        popupWindowRef.current = window.open(
          oauth2Endpoint,
          "OAuthPopup",
          "width=1200,height=800,top=0,left=0"
        );

        if (!popupWindowRef.current) {
          throw new Error("Popup was blocked. Please allow popups for this site.");
        }

        // Reset diagnostic refs
        messageReceivedRef.current = false;
        popupOpenTimeRef.current = Date.now();
        intervalCountRef.current = 0;

        // Mark popup as open - this enables the message listener
        setIsPopupOpen(true);

        // Interval to monitor popup state and provide diagnostic info
        popupIntervalRef.current = setInterval(() => {
          intervalCountRef.current += 1;
          const elapsedSeconds = Math.round((Date.now() - popupOpenTimeRef.current) / 1000);
          
          const popupExists = !!popupWindowRef.current;
          const popupClosed = popupWindowRef.current?.closed ?? true;
          
          // Try to check popup location (will fail cross-origin, that's expected)
          let popupLocationAccessible = false;
          let popupLocationHref = "cross-origin (expected)";
          try {
            if (popupWindowRef.current && !popupWindowRef.current.closed) {
              popupLocationHref = popupWindowRef.current.location.href;
              popupLocationAccessible = true;
            }
          } catch {
            // Cross-origin access denied - this is expected after OAuth redirect
            popupLocationAccessible = false;
          }

          if (!popupWindowRef.current || popupWindowRef.current.closed) {
            if (popupIntervalRef.current) {
              clearInterval(popupIntervalRef.current);
              popupIntervalRef.current = null;
            }
            // Mark popup as closed - this disables the message listener
            setIsPopupOpen(false);
            setIsLaunching(false);
            
            // If popup closed but we never received a message, the OAuth might have succeeded
            // but postMessage failed - trigger a connection refresh anyway
            if (!messageReceivedRef.current) {
              // Use ref to get the latest callback (avoids stale closure)
              onSuccessRef.current?.();
            }
          }
        }, 2000); // Check every 2 seconds for faster feedback
      } catch (error) {
        setIsLaunching(false);
        const err = error instanceof Error ? error : new Error(String(error));
        // Use ref to get the latest callback (avoids stale closure)
        onErrorRef.current?.(err);
        toast.error(err.message || "Failed to launch OAuth flow");
      }
    },
    [authorizationConfig, resourceIds]
  );

  // Only listen for OAuth callback messages when the popup is actually open
  // This prevents unnecessary message processing when idle
  useEffect(() => {
    // Don't set up listener if popup is not open
    if (!isPopupOpen) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      const redirectUri = serverConfig.OAUTH2_REDIRECT_URI;
      if (!redirectUri) {
        return;
      }

      let trustedOrigin: string;
      try {
        trustedOrigin = new URL(redirectUri).origin;
      } catch {
        return;
      }

      // Accept messages from either the OAuth redirect URI or the parent window origin
      const parentWindowOrigin = window.location.origin;
      const isFromTrustedOrigin = event.origin === trustedOrigin;
      const isFromParentOrigin = event.origin === parentWindowOrigin;
      
      // Silently ignore messages from untrusted origins
      if (!isFromTrustedOrigin && !isFromParentOrigin) {
        return;
      }

      // Only process messages with a status field (OAuth callback format)
      if (!event.data || typeof event.data !== "object" || !("status" in event.data)) {
        return;
      }

      const message = event.data;
      
      // Mark that we received a valid OAuth message
      messageReceivedRef.current = true;

      if (message?.status === "success") {
        // Clear the interval since we got a successful message
        if (popupIntervalRef.current) {
          clearInterval(popupIntervalRef.current);
          popupIntervalRef.current = null;
        }
        setIsPopupOpen(false);
        // Use ref to get the latest callback (avoids stale closure)
        onSuccessRef.current?.();
      } else if (message?.status) {
        const error = new Error(message?.message || "OAuth authorization failed");
        setIsPopupOpen(false);
        // Use ref to get the latest callback (avoids stale closure)
        onErrorRef.current?.(error);
        toast.error(message?.message || "OAuth authorization failed");
      }

      if (popupIntervalRef.current) {
        clearInterval(popupIntervalRef.current);
        popupIntervalRef.current = null;
      }
      setIsLaunching(false);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (popupIntervalRef.current) {
        clearInterval(popupIntervalRef.current);
      }
    };
  }, [isPopupOpen]);  // Removed onSuccess/onError from deps - using refs instead

  return {
    launchOAuthFlow,
    isLaunching,
  };
}
