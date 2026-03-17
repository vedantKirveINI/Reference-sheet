import posthog from "posthog-js";
import * as Sentry from "@sentry/react";
import { APP_VERSION } from "./constants/app-version";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./i18n";
import { RootApp } from "./RootApp";

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  autocapture: true,
  capture_pageview: true,
  session_recording: {
    maskAllInputs: true,
  },
});

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.globalHandlersIntegration({ onerror: true, onunhandledrejection: true }),
    Sentry.breadcrumbsIntegration({
      console: true, dom: true, fetch: true, history: true, xhr: true,
    }),
  ],
  tracesSampleRate: import.meta.env.MODE === "production" ? 0.1 : 1.0,
  tracePropagationTargets: ["localhost", /oute\.app/, /^(?!.*accounts\.tinycommand\.com).*tinycommand\.com$/],
  enabled: import.meta.env.VITE_ENABLE_SENTRY === "true",
  release: APP_VERSION,
  initialScope: { tags: { service: "tinytable" } },
});

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<p>Something went wrong.</p>}>
    <StrictMode>
      <BrowserRouter>
        <RootApp />
      </BrowserRouter>
    </StrictMode>
  </Sentry.ErrorBoundary>
);
