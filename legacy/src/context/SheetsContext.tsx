import { useAuth } from "@oute/oute-ds.common.molecule.tiny-auth";
import { createContext, useCallback, useState, useEffect, ReactNode } from "react";

interface SheetsContextValue {
	assetId: string | null;
	updateAssetId: (id: string | null) => void;
	workspaceId: string | null;
	updateWorkspaceId: (id: string | null) => void;
	parentId: string | null;
	updateParentId: (id: string | null) => void;
	projectId: string | null;
	updateProjectId: (id: string | null) => void;
	user: any;
	assetAccessDetails: any;
	logout?: () => Promise<void>;
	isMobile: boolean;
	screenDimensions: { width: number; height: number };
	isTablet: boolean;
	isDesktop: boolean;
	isSmallMobile: boolean;
}

interface SheetsContextProviderProps {
	children: ReactNode;
}

export const SheetsContext = createContext<SheetsContextValue | null>(null);

export const SheetsContextProvider = ({ children }: SheetsContextProviderProps) => {
	const [assetId, setAssetId] = useState<string | null>(null);
	const [workspaceId, setWorkspaceId] = useState<string | null>(null);
	const [parentId, setParentId] = useState<string | null>(null);
	const [projectId, setProjectId] = useState<string | null>(null);

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

	const updateAssetId = useCallback((id: string | null) => {
		setAssetId(id);
	}, []);

	const updateWorkspaceId = useCallback((id: string | null) => {
		setWorkspaceId(id);
	}, []);

	const updateParentId = useCallback((id: string | null) => {
		setParentId(id);
	}, []);

	const updateProjectId = useCallback((id: string | null) => {
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

