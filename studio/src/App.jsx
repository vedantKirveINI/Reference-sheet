import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { ICStudioContextProvider } from "./ICStudioContext";
import Landing from "./pages/landing";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistor, store } from "./redux/store";
import PageProcessingLoader from "./components/loaders/PageProcessingLoader";
import TinyCommandAuthController from "./module/tiny-auth-wrapper";
import { Toaster } from "@/components/ui/toaster";
import { EscapeStackProvider } from "./contexts/EscapeStackContext";
import { parseUserFromToken } from "./utils/auth-utils";
import "oute-tokens/dist/tokens.css";

const EmbedRoute = React.lazy(() => import("./embed/EmbedRoute"));

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let timeoutId;
    let observer;
    // Check if FCP is already available
    const paintEntries = performance.getEntriesByType("paint");
    const fcpEntry = paintEntries.find(
      (entry) => entry.name === "first-contentful-paint",
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

  const isEmbedRoute = window.location.pathname === "/embed";

  if (isEmbedRoute) {
    return (
      <EscapeStackProvider>
        <Provider store={store}>
          <BrowserRouter
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true,
            }}
          >
            <Suspense fallback={null}>
              <EmbedRoute />
            </Suspense>
          </BrowserRouter>
        </Provider>
      </EscapeStackProvider>
    );
  }

  const appContent = (
    <EscapeStackProvider>
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
    </EscapeStackProvider>
  );

  return (
    <>
      <Toaster />
      {isLoading ? (
        <PageProcessingLoader
          height="12rem"
          style={{
            position: "unset",
            boxShadow: "none",
            background: "none",
          }}
          showLogo={true}
        />
      ) : (
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
      )}
    </>
  );
};

export default App;
