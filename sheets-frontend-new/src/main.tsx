import posthog from "posthog-js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import "./i18n";
import { RootApp } from "./RootApp";

// Global error tracing — catches errors that React/canvas/socket handlers miss
window.addEventListener('error', (e) => {
  console.error('[TRACE:global] Uncaught error:', e.error?.message || e.message, e.error?.stack || '', e.filename, 'line:', e.lineno);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[TRACE:global] Unhandled promise rejection:', e.reason);
});

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST,
  autocapture: true,
  capture_pageview: true,
  session_recording: {
    maskAllInputs: true,
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <RootApp />
    </BrowserRouter>
  </StrictMode>
);
