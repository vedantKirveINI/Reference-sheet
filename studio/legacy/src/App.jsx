import React, { useEffect, useState, createContext, useContext } from "react";
import { BrowserRouter } from "react-router-dom";
import { ICStudioContextProvider } from "./ICStudioContext";
import Landing from "./pages/landing";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./redux/store";
import PageProcessingLoader from "./components/loaders/PageProcessingLoader";
import TinyCommandAuthController from "@oute/oute-ds.common.molecule.tiny-auth";
import "oute-tokens/dist/tokens.css";

const MockAuthContext = createContext({
  user: null,
  logout: () => {},
  assetAccessDetails: null,
});

const MockAuthProvider = ({ children, mockUser }) => {
  return (
    <MockAuthContext.Provider
      value={{
        user: mockUser,
        logout: () => {},
        assetAccessDetails: {},
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
};

export { MockAuthContext };

// Hardcoded token to bypass Keycloak
const BYPASS_KEYCLOAK_TOKEN =
  "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJEN0t1VlR0eEQ3a2pUbEFkb3Q0WVFMTk90UUNEWWJGZnFEeU9URGJ3VWdjIn0.eyJleHAiOjE3NjkxNjU1MzcsImlhdCI6MTc2NjU3MzUzNywianRpIjoiODJjYTA2OTgtZWQ4Yi00ZTI1LTg3NGQtZjM4ZjgxNWIwOTI1IiwiaXNzIjoiaHR0cHM6Ly9hY2NvdW50cy5nb2ZvLmFwcC9yZWFsbXMvb3V0ZSIsImF1ZCI6ImFjY291bnQiLCJzdWIiOiI4MjFhNTRmOC01ZjU2LTRmYzktYTIzNi02NmU0Njc0NTE2NDQiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJvdXRlLWljLWNhbnZhcyIsInNpZCI6IjZkNjc2YmJkLTBiY2YtNDUzMi1hYTJiLWM3ZmU0ODcwODJhNSIsImFjciI6IjEiLCJhbGxvd2VkLW9yaWdpbnMiOlsiaHR0cHM6Ly9vdXRlLmFwcCIsImh0dHBzOi8vdWx0aW1hdGUtc2hlZXQtc2hhcmluZy5kMmF5OWU5cWgxOGl1Mi5hbXBsaWZ5YXBwLmNvbSIsImh0dHBzOi8vd2NsLm91dGUuYXBwIiwiaHR0cHM6Ly9hdXRoLm91dGUuYXBwIiwiaHR0cHM6Ly9mYy1lYzIub3V0ZS5hcHAiLCJodHRwczovL2NhbnZhcy12Mi5kM2pneXNkdTcyYnRpei5hbXBsaWZ5YXBwLmNvbSIsImh0dHBzOi8vZWUzZjAwOTctNmU2NS00ZGU1LWI5OTktNzljNzM5YjE2YjZiLTAwLTJ4bm55cmd5emZsd3ouc2lza28ucmVwbGl0LmRldiIsImh0dHBzOi8vcmFodWwxMjMudHVubmVsLnBoYXJtYWN5YXBwLmluIiwiaHR0cHM6Ly9pY2Mub3V0ZS5hcHAiLCJodHRwOi8vbG9jYWxob3N0OjUxNzMiLCJodHRwOi8vbG9jYWxob3N0OjUxNzQiLCJodHRwczovL21haWwub3V0ZS5hcHAiLCJodHRwczovL2hhbmRsZS1vYXV0aC5vdXRlLmFwcCIsImh0dHBzOi8vY29udGVudC5vdXRlLmFwcCIsImh0dHBzOi8vY29tbWFuZGJhci1wb2MuZDNqZ3lzZHU3MmJ0aXouYW1wbGlmeWFwcC5jb20iLCJodHRwczovL2VtYWlsLm91dGUuYXBwIiwiaHR0cHM6Ly9hZ2VudC5vdXRlLmFwcCIsImh0dHBzOi8vY3Vyc29yLWNvZGUuZDFra2t3dHg3N2drNmguYW1wbGlmeWFwcC5jb20iLCJodHRwczovL3d3dy50aW55Y29tbWFuZC5jb20iLCJodHRwczovL2ljbC5vdXRlLmFwcCIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMiIsImh0dHBzOi8vaWMub3V0ZS5hcHAiLCJodHRwczovL3V4bWFpbC5vdXRlLmFwcCIsImh0dHBzOi8vdGVtcGxhdGUub3V0ZS5hcHAiLCJodHRwczovL2NoYW5kLXByYXRpay5kMWtra3d0eDc3Z2s2aC5hbXBsaWZ5YXBwLmNvbSIsImh0dHBzOi8vZGV2ZWxvcC5kM2NyMTRvajhzam1tYS5hbXBsaWZ5YXBwLmNvbSIsIioiLCJodHRwOi8vbG9jYWxob3N0OjMwMDEiLCJodHRwczovL2Ntcy5vdXRlLmFwcCIsImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMCIsImh0dHBzOi8vc2hlZXRzLm91dGUuYXBwIiwiaHR0cHM6Ly9jaHVuay1yZXZlcnQuZDNqZ3lzZHU3MmJ0aXouYW1wbGlmeWFwcC5jb20iLCJodHRwczovL2FjY291bnQub3V0ZS5hcHAiLCJodHRwczovL2NvbnRlbnQuZ29mby5hcHAiLCJodHRwczovL2ZjLm91dGUuYXBwIiwiaHR0cHM6Ly93Yy5vdXRlLmFwcCIsImh0dHBzOi8vbG9naW4ub3V0ZS5hcHAiXSwicmVhbG1fYWNjZXNzIjp7InJvbGVzIjpbIm9mZmxpbmVfYWNjZXNzIiwiZGVmYXVsdC1yb2xlcy1vdXRlIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJkZWxldGUtYWNjb3VudCIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsIm5hbWUiOiJSYWh1bCBSYW5hIiwicHJlZmVycmVkX3VzZXJuYW1lIjoicmFodWx0ZXN0QGdtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJSYWh1bCIsImZhbWlseV9uYW1lIjoiUmFuYSIsImVtYWlsIjoicmFodWx0ZXN0QGdtYWlsLmNvbSJ9.J3cikjg_bStA70Lcylvq64zBcEsuQ4RLnk5rYFz8OMFGxn_RAISCowYNhsYs7Ue1TYFwxmo5ggg3Arz_iWtbj4P7p_1mooD6V37VUAcoBosTtcseW4JrG64QxYwb7dBGhUOeHixqVInCDoyekdG5nOijj9EeCgQWjV5i4KhQYz26ERlFFqgVwnwIP-aBh4yyLGPsUWtZNwTArFQdH_8y8ZQ9iLVRgNE6C5nokYm-fUmvxZ7WZ6lh7Mn7OfF_4E7cc1MX2FemLEWfY9-Ca_o1QzcdyoIYeo7ZT-1nK0mSDwNFW7br4FkzpKHtZ_7NpZumKa-ZPAwP6YkB5e1xnnajKw";

// Set to true to bypass Keycloak, false to use Keycloak
const BYPASS_KEYCLOAK = true;

// Mock user extracted from the bypass token
const MOCK_USER = {
  sub: "52db06c1-bca0-4e2b-b70c-df025d0edd1b",
  email: "test@iipl.io",
  name: "Ankit Solankiff",
  given_name: "Ankit",
  family_name: "Solankiff",
  preferred_username: "test@iipl.io",
  email_verified: false,
};

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Set the token early if bypassing Keycloak
  useEffect(() => {
    if (BYPASS_KEYCLOAK) {
      window.accessToken = BYPASS_KEYCLOAK_TOKEN;
      // Set cookies for the auth controller
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      document.cookie = `access_token=${BYPASS_KEYCLOAK_TOKEN}; path=/; expires=${futureDate.toUTCString()}`;
      document.cookie = `access_token_expires_at=${futureDate.getTime()}; path=/; expires=${futureDate.toUTCString()}`;
    }
  }, []);

  useEffect(() => {
    let timeoutId;
    let observer;
    // Check if FCP is already available
    const paintEntries = performance.getEntriesByType("paint");
    const fcpEntry = paintEntries.find(
      (entry) => entry.name === "first-contentful-paint"
    );
    if (fcpEntry) {
      setIsLoading(false);
      return;
    }
    if (PerformanceObserver.supportedEntryTypes.includes("paint")) {
      try {
        // ✅ Modern Browsers: Use PerformanceObserver for accurate FCP detection
        observer = new PerformanceObserver((list) => {
          const entries = list.getEntriesByName("first-contentful-paint");
          if (entries.length > 0) {
            setIsLoading(false);
            observer.disconnect();
          }
        });

        observer.observe({ type: "paint", buffered: true });
      } catch (error) {}
    }

    // ✅ Safari Fallback: Use `load` event & a polling mechanism
    const checkFCP = () => {
      if (document.readyState === "complete") {
        setIsLoading(false);
      } else {
        timeoutId = setTimeout(checkFCP, 100);
      }
    };

    window.addEventListener("load", () => {
      setIsLoading(false);
    });

    timeoutId = setTimeout(checkFCP, 100);

    // Cleanup function
    return () => {
      if (observer) observer.disconnect();
      clearTimeout(timeoutId);
      window.removeEventListener("load", () => setIsLoading(false));
    };
  }, []);

  const appContent = (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ICStudioContextProvider>
            <Landing />
          </ICStudioContextProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );

  return isLoading ? (
    <PageProcessingLoader
      height="12rem"
      style={{
        position: "unset",
        boxShadow: "none",
        background: "none",
      }}
      showLogo={true}
    />
  ) : BYPASS_KEYCLOAK ? (
    // Bypass Keycloak - wrap with mock auth provider
    <MockAuthProvider mockUser={MOCK_USER}>{appContent}</MockAuthProvider>
  ) : (
    // Use Keycloak authentication
    <TinyCommandAuthController
      loginUrl={process.env.REACT_APP_LOGIN_URL}
      clientId={process.env.REACT_APP_KEYCLOAK_RESOURCE}
      realm={process.env.REACT_APP_KEYCLOAK_REALM}
      serverUrl={process.env.REACT_APP_KEYCLOAK_AUTH_SERVER_URL}
      assetServerUrl={process.env.REACT_APP_OUTE_SERVER}
      hubOrigin={process.env.REACT_APP_HUB_ORIGIN}
    >
      {appContent}
    </TinyCommandAuthController>
  );
};

export default App;
