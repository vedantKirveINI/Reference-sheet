import Clarity from "@microsoft/clarity";
import {
	useCallback,
	useContext,
	useEffect,
	useState,
	ComponentType,
} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { SheetsContext } from "@/context/SheetsContext";
import { decodeParams } from "@/utils/encodeDecodeUrl";

// Type definitions
interface DecodedParams {
	w?: string; // workspaceId
	pr?: string; // projectId
	pa?: string; // parentId
	a?: string; // assetId
}

interface AuthRouteProps {
	component: ComponentType<any>;
	[key: string]: any; // For additional props passed to the component
}

const AuthRoute = ({
	component: Component,
	...componentProps
}: AuthRouteProps) => {
	const context = useContext(SheetsContext);

	if (!context) {
		throw new Error("AuthRoute must be used within SheetsContextProvider");
	}

	const {
		updateAssetId,
		updateWorkspaceId,
		updateParentId,
		updateProjectId,
		user,
	} = context;

	const [searchParams] = useSearchParams();

	const navigate = useNavigate();

	const { w, pr, pa, a } =
		decodeParams<DecodedParams>(searchParams?.get("q") || "") || {};

	// const { keycloak } = useKeycloak();
	const [valid, setValid] = useState<boolean>(false);

	const validateSession = useCallback(async (): Promise<void> => {
		setValid(false);
		updateWorkspaceId(w || null);
		updateProjectId(pr || null);
		updateParentId(pa || null);
		updateAssetId(a || null);
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
		if (process.env.REACT_APP_CLARITY_ID) {
			Clarity.init(process.env.REACT_APP_CLARITY_ID);
			Clarity.identify(user?.sub, user?.sub, "", user?.email);
			Clarity.setTag("user_id", user?.sub);
		}
	}, [user]);

	if (!valid) return null;

	return <Component {...componentProps} />;
};
export default AuthRoute;
