import { useAuth } from "@oute/oute-ds.common.molecule.tiny-auth";
import { createContext, useCallback, useState, useEffect } from "react";
// import { useKeycloak } from "@react-keycloak/web";

export const SheetsContext = createContext(null);

export const SheetsContextProvider = ({ children }) => {
	// const { keycloak } = useKeycloak();
	const [assetId, setAssetId] = useState(null);
	const [workspaceId, setWorkspaceId] = useState(null);
	const [parentId, setParentId] = useState(null);
	const [projectId, setProjectId] = useState(null);

	// Mobile detection state
	const [isMobile, setIsMobile] = useState(false);
	const [screenDimensions, setScreenDimensions] = useState({
		width: typeof window !== "undefined" ? window.innerWidth : 0,
		height: typeof window !== "undefined" ? window.innerHeight : 0,
	});

	const { user, assetAccessDetails } = useAuth();

	// Mobile detection effect
	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			const height = window.innerHeight;

			setScreenDimensions({ width, height });
			setIsMobile(width <= 768); // 768px breakpoint for mobile
		};

		// Set initial value
		handleResize();

		// Add event listener
		window.addEventListener("resize", handleResize);

		// Cleanup
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const logout = async () => {
		// await keycloak.logout();
	};

	const updateAssetId = useCallback((id) => {
		setAssetId(id);
	}, []);

	const updateWorkspaceId = useCallback((id) => {
		setWorkspaceId(id);
	}, []);

	const updateParentId = useCallback((id) => {
		setParentId(id);
	}, []);

	const updateProjectId = useCallback((id) => {
		setProjectId(id);
	}, []);

	return (
		<SheetsContext.Provider
			value={{
				assetId,
				updateAssetId,
				workspaceId,
				updateWorkspaceId,
				parentId,
				updateParentId,
				projectId,
				updateProjectId,
				logout,
				user,
				assetAccessDetails,
				isMobile,
				screenDimensions,
				isTablet:
					screenDimensions.width <= 1024 &&
					screenDimensions.width > 768,
				isDesktop: screenDimensions.width > 1024,
				isSmallMobile: screenDimensions.width <= 480,
			}}
		>
			{children}
		</SheetsContext.Provider>
	);
};
