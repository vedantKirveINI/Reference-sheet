import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import "./index.css";
import * as Sentry from "@sentry/react";
import App from "./App";
import { APP_VERSION } from "./utils/app-version";
import { CANVAS_MODE } from "./module/constants";

const Root = () => {
  return <App />;
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
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
