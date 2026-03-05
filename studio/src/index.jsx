import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import * as Sentry from "@sentry/react";
import App from "./App";
import { APP_VERSION } from "./utils/app-version";
import { CANVAS_MODE } from "./module/constants";
import { Toaster } from "@/components/ui/sonner";

// Remove Intercom launcher bubble immediately before React mounts
// This handles any cached Intercom widgets from previous sessions
(function removeIntercomLauncher() {
  const selectors = [
    "#intercom-container",
    ".intercom-lightweight-app",
    ".intercom-launcher",
    'iframe[name="intercom-launcher-frame"]',
    'script[id="_intercom_npm_loader"]',
  ];
  const remove = () => {
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => el.remove());
    });
  };
  remove();
  // Also observe for late-loading elements
  if (document.body) {
    const observer = new MutationObserver(remove);
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      remove();
      const observer = new MutationObserver(remove);
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }
})();

const Root = () => {
  return (
    <>
      <App />
      <Toaster />
    </>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    // Sentry.replayIntegration({
    //   maskAllText: false,
    //   blockAllMedia: false,
    // }),
    Sentry.replayCanvasIntegration(),
    Sentry.globalHandlersIntegration({
      onerror: true,
      onunhandledrejection: true,
    }),
    Sentry.breadcrumbsIntegration({
      console: true, // Capture console logs
      dom: true, // Capture DOM interactions
      fetch: true, // Capture fetch requests
      history: true, // Capture navigation events
      sentry: true, // Capture Sentry events
      xhr: true, // Capture XMLHttpRequest
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    "localhost",
    /oute\.app/,
    // Exclude 'accounts.tinycommand.com' but include other 'tinycommand.com' URLs
    /^(?!.*accounts\.tinycommand\.com).*tinycommand\.com$/,
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  beforeSend(event) {
    event.tags = {
      ...event.tags,
      domain: window.location.hostname,
      canvasMode: CANVAS_MODE(),
    };

    if (window.location.hostname === "localhost") {
      // Drop event if on localhost
      return null;
    }
    return event; // Otherwise send the event
  },
  enabled: process.env.REACT_APP_ENABLE_SENTRY === "true",
  release: APP_VERSION,
});

root.render(<Root />);
