import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useCallback,
} from "react";
import {
  cleanUpUrl,
  getTokensFromUrl,
  isAccessTokenExpired,
  parseCookie,
  setTokensInCookies,
  setSessionIdCookie,
} from "./utils";
import { getAssetAccessInfo, keycloakLogout, refreshToken } from "./services";
import useSocket from "./hooks/useSocket";
import Utility from "oute-services-utility-sdk";
import LoadingScreen from "./components/LoadingScreen";

declare global {
  interface Window {
    accessToken?: string;
  }
}

// Create a type for our context value
type AuthContextType = {
  user: any;
  logout: () => void;
  assetAccessDetails: any;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  logout: () => {},
  assetAccessDetails: null,
});

export const useAuth = () => useContext(AuthContext);

const TinyCommandAuthController = ({
  loginUrl,
  clientId,
  realm,
  serverUrl,
  children,
  assetId,
  assetServerUrl,
  hubOrigin,
}) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [assetAccessDetails, setAssetAccessDetails] = useState({});
  const [sessionId, setSessionId] = useState(() => {
    try {
      const cookies = parseCookie();
      return cookies["session_id"] || "";
    } catch {
      return "";
    }
  });

  const persistSessionId = useCallback((nextSessionId: string) => {
    setSessionId(nextSessionId);
    const cookies = parseCookie();
    const refreshExpiresRaw = cookies["refresh_token_expires_at"];
    const refreshExpires = refreshExpiresRaw
      ? new Date(refreshExpiresRaw)
      : undefined;
    setSessionIdCookie({
      sessionId: nextSessionId,
      expires_at: nextSessionId ? refreshExpires : new Date(0),
    });
  }, []);


  const getRootDomain = () => {
    const parts = window.location.hostname.split(".");
    // Handles domains like "sub.example.co.in" or "example.com"
    if (parts.length >= 2) {
      return "." + parts.slice(-2).join("."); // e.g., ".example.com"
    }
    return window.location.hostname; // fallback
  };

  const logout = async (hitKeycloakLogout = true) => {
    try {
      const cookies = parseCookie();
      const storedIdToken = cookies["id_token"];
      const storedRefreshToken = cookies["refresh_token"];

      const domain = getRootDomain();

      const cookieNames = [
        "access_token",
        "refresh_token",
        "id_token",
        "access_token_expires_at",
        "refresh_token_expires_at",
        "session_id",
      ];

      cookieNames.forEach((name) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      persistSessionId("");

      if (hitKeycloakLogout) {
        await keycloakLogout({
          serverUrl,
          realm,
          clientId,
          idTokenHint: storedIdToken,
          refreshToken: storedRefreshToken,
        });
      }
      window.location.href = `${loginUrl}/logout`;
    } catch (e) {
    }
  };

  useSocket({ authenticated, assetServerUrl, logout, sessionId });

  // useCrossAppLogout({ onLogout: logoutWithoutHubCall, hubOrigin: hubOrigin });

  const redirectToLogin = useCallback(() => {
    const redirect_uri = encodeURIComponent(window.location.href);
    window.location.replace(`${loginUrl}?redirect_uri=${redirect_uri}`);
  }, [loginUrl]);

  const getUserAccess = useCallback(
    async ({ token = "" }) => {
      if (!assetId || !assetServerUrl) return {};
      const { result = {} } = await getAssetAccessInfo({
        assetServerUrl,
        assetId,
        token,
      });
      return result;
    },
    [assetId, assetServerUrl]
  );

  const handleUnauthorized = useCallback(async () => {
    persistSessionId("");
    const userAccessResult = await getUserAccess({});
    if (userAccessResult?.can_access) {
      window.accessToken = userAccessResult?.token;
      setAssetAccessDetails(userAccessResult);
      setAuthenticated(true);
      setLoading(false);
    } else {
      redirectToLogin();
    }
  }, [getUserAccess, redirectToLogin, persistSessionId]);

  const handleSuccess = useCallback(
    async ({ storedIdToken, storedAccessToken }) => {
      try {
        window.accessToken = storedAccessToken;
        const payload = JSON.parse(
          Utility.fromBase64(storedIdToken.split(".")[1])
        );
        setUserInfo(payload || {});
        const resolvedSessionId = payload?.sid || "";
        persistSessionId(resolvedSessionId);
        const userAccessResult = await getUserAccess({
          token: storedAccessToken,
        });
        setAssetAccessDetails(userAccessResult);
        setAuthenticated(true);
        setLoading(false);
      } catch {
        setUserInfo({});
        redirectToLogin();
      }
    },
    [getUserAccess, redirectToLogin, persistSessionId]
  );

  useEffect(() => {
    const bypassKeycloak = import.meta.env.VITE_BYPASS_KEYCLOAK === "true";
    const bypassToken = import.meta.env.VITE_BYPASS_TOKEN;

    if (bypassKeycloak && bypassToken) {
      window.accessToken = bypassToken;
      try {
        const payload = JSON.parse(atob(bypassToken.split(".")[1]));
        setUserInfo(payload || {});
      } catch {
        setUserInfo({});
      }
      setAuthenticated(true);
      setLoading(false);
      return;
    }

    if (!loginUrl || !clientId || !realm || !serverUrl || !assetServerUrl) {
      alert("Please pass all required props");
      return;
    }
    async function handleAuth() {
      setLoading(true);

      // 1. Extract tokens from URL
      const {
        access_token,
        refresh_token,
        id_token,
        access_token_expires_at,
        refresh_token_expires_at,
      } = getTokensFromUrl();

      // return;
      // 2. If tokens are in URL, store them in cookies
      if (
        access_token &&
        refresh_token &&
        access_token_expires_at &&
        refresh_token_expires_at
      ) {
        setTokensInCookies({
          access_token,
          id_token,
          refresh_token,
          access_token_expires_at: new Date(access_token_expires_at), //new Date(Number(expires_at)),
          refresh_token_expires_at: new Date(refresh_token_expires_at), //new Date(Number(expires_at) + 86400000),
        });

        // Clean up URL
        cleanUpUrl();
      }

      // 3. Check authentication status
      const cookies = parseCookie();
      const storedAccessToken = cookies["access_token"];
      const storedRefreshToken = cookies["refresh_token"];
      const storedExpiresAt = cookies["access_token_expires_at"];
      const storedIdToken = cookies["id_token"];

      if (!storedAccessToken) {
        handleUnauthorized();
        return;
      }

      // 4. User can login and is authorized
      if (storedAccessToken && !isAccessTokenExpired(storedExpiresAt)) {
        handleSuccess({ storedIdToken, storedAccessToken });
        return;
      }

      // 5. Handle token refresh
      if (isAccessTokenExpired(storedExpiresAt)) {
        if (!storedRefreshToken) {
          handleUnauthorized();
          return;
        }

        try {
          const data = await refreshToken({
            refreshToken: storedRefreshToken,
            clientId,
            realm,
            serverUrl,
          });

          if (!data?.access_token) {
            handleUnauthorized();
            return;
          }
          setTokensInCookies({
            access_token: data.access_token,
            refresh_token: data.refresh_token,
            access_token_expires_at: new Date(
              Date.now() + data.expires_in * 1000
            ),
            refresh_token_expires_at: new Date(
              Date.now() + data.refresh_expires_in * 1000
            ),
          });

          handleSuccess({
            storedIdToken,
            storedAccessToken: data.access_token,
          });
        } catch (error) {
          handleUnauthorized();
        }
      }
    }

    handleAuth();
  }, [
    loginUrl,
    clientId,
    realm,
    serverUrl,
    assetServerUrl,
    handleSuccess,
    handleUnauthorized,
  ]);

  return (
    <AuthContext.Provider
      value={{ user: userInfo, logout, assetAccessDetails }}
    >
      {loading ? <LoadingScreen /> : !authenticated ? null : children}
    </AuthContext.Provider>
  );
};

export default TinyCommandAuthController;