import TinyCommandAuthController from "@oute/oute-ds.common.molecule.tiny-auth";
import * as Sentry from "@sentry/react";
import { serverConfig } from "oute-ds-utils";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { SheetsContextProvider } from "./context/sheetsContext";
import useDecodedUrlParams from "./hooks/useDecodedUrlParams";

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
		// "localhost",
		/oute\.app/,
		// Exclude 'accounts.tinycommand.com' but include other 'tinycommand.com' URLs
		/^(?!.*accounts\.tinycommand\.com).*tinycommand\.com$/,
	],
	// Session Replay
	replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
	replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
	beforeSend(event) {
		if (window.location.hostname === "localhost") {
			// Drop event if on localhost
			return null;
		}
		return event; // Otherwise send the event
	},
	enabled: process.env.REACT_APP_ENABLE_SENTRY === "true",
	release: process.env.REACT_APP_SENTRY_RELEASE_ID,
});

const RootApp = () => {
	const { assetId } = useDecodedUrlParams();

	return (
		<TinyCommandAuthController
			assetId={assetId}
			assetServerUrl={serverConfig.OUTE_SERVER}
			loginUrl={process.env.REACT_APP_LOGIN_URL}
			clientId={process.env.REACT_APP_KEYCLOAK_RESOURCE}
			realm={process.env.REACT_APP_KEYCLOAK_REALM}
			serverUrl={process.env.REACT_APP_KEYCLOAK_AUTH_SERVER_URL}
		>
			<SheetsContextProvider>
				<App />
			</SheetsContextProvider>
		</TinyCommandAuthController>
	);
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
	<BrowserRouter>
		<RootApp />
	</BrowserRouter>,
);
