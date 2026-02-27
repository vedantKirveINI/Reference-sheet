import Clarity from "@microsoft/clarity";
// import { useKeycloak } from "@react-keycloak/web";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { SheetsContext } from "../../context/sheetsContext";
import { decodeParams } from "../../utils/encodeDecodeUrl";

const AuthRoute = ({ component: Component, ...componentProps }) => {
	const {
		updateAssetId,
		updateWorkspaceId,
		updateParentId,
		updateProjectId,
	} = useContext(SheetsContext);

	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const { w, pr, pa, a } = decodeParams(searchParams?.get("q")) || {};

	// const { keycloak } = useKeycloak();
	const [valid, setValid] = useState(false);

	const validateSession = useCallback(async () => {
		setValid(false);
		updateWorkspaceId(w);
		updateProjectId(pr);
		updateParentId(pa);
		updateAssetId(a);
		setValid(true);
	}, [
		a,
		pr,
		pa,
		updateAssetId,
		updateParentId,
		updateProjectId,
		updateWorkspaceId,
		w,
	]);

	useEffect(() => {
		if (!searchParams.get("q")) {
			navigate("/redirect-to-home");
		}
	}, [navigate, searchParams]);

	useEffect(() => {
		// if (keycloak?.authenticated) {
		validateSession();
		// }
	}, [
		// keycloak?.authenticated,
		validateSession,
	]);

	useEffect(() => {
		Clarity.init(process.env.REACT_APP_CLARITY_ID);
	}, []);

	if (!valid) return null;

	return <Component {...componentProps} />;
};
export default AuthRoute;
