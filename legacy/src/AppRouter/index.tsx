import AuthRoute from "@/components/AuthRoute";
import MainPage from "@/pages/MainPage";
import Redirect from "@/pages/Redirect";
import { serverConfig } from "oute-ds-utils";
import { Route, Routes } from "react-router-dom";

function AppRouter() {
	return (
		<Routes>
			<Route path="/" element={<AuthRoute component={MainPage} />} />
			{/* <Route
				path="/ai-enrichment"
				element={<AuthRoute component={AiEnrichment} />}
			/> */}
			<Route
				path="*"
				element={<Redirect url={serverConfig.WC_LANDING_URL} />}
			/>
		</Routes>
	);
}

export default AppRouter;
