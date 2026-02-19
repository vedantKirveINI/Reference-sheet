import * as Sentry from "@sentry/react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import App from "@/App";
import { AuthProvider } from "@/lib/auth";
import { serverConfig } from "@/lib/server-config";
import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import { SheetsContextProvider } from "@/context/SheetsContext";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayCanvasIntegration(),
    Sentry.globalHandlersIntegration({
      onerror: true,
      onunhandledrejection: true,
    }),
    Sentry.breadcrumbsIntegration({
      console: true,
      dom: true,
      fetch: true,
      history: true,
      sentry: true,
      xhr: true,
    }),
  ],
  tracesSampleRate: 1.0,
  tracePropagationTargets: [/oute\.app/, /^(?!.*accounts\.tinycommand\.com).*tinycommand\.com$/],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event) {
    if (window.location.hostname === "localhost") {
      return null;
    }
    return event;
  },
  enabled: process.env.REACT_APP_ENABLE_SENTRY === "true",
  release: process.env.REACT_APP_SENTRY_RELEASE_ID,
});

const RootApp = () => {
  const { assetId } = useDecodedUrlParams();

  return (
    <AuthProvider
      assetId={assetId}
      assetServerUrl={serverConfig.OUTE_SERVER}
      loginUrl={process.env.REACT_APP_LOGIN_URL}
      clientId={process.env.REACT_APP_KEYCLOAK_RESOURCE}
      realm={process.env.REACT_APP_KEYCLOAK_REALM}
      serverUrl={process.env.REACT_APP_KEYCLOAK_AUTH_SERVER_URL}
    >
      <SheetsContextProvider>
        <App />
        <Toaster position="top-right" richColors closeButton />
      </SheetsContextProvider>
    </AuthProvider>
  );
};

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <BrowserRouter>
    <RootApp />
  </BrowserRouter>,
);
