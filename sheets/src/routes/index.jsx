import { serverConfig } from "oute-ds-utils";
import React from "react";
import { Route, Routes } from "react-router-dom";

import AuthRoute from "../components/AuthRoute";
import AiEnrichment from "../pages/AiEnrichment";
import Redirect from "../pages/Redirect";
import WelcomeScreen from "../pages/WelcomeScreen";

function AppRouter() {
	return (
		<Routes>
			<Route path="/" element={<AuthRoute component={WelcomeScreen} />} />
			<Route
				path="/ai-enrichment"
				element={<AuthRoute component={AiEnrichment} />}
			/>
			<Route
				path="*"
				element={<Redirect url={serverConfig.WC_LANDING_URL} />}
			/>
		</Routes>
	);
}

export default AppRouter;
