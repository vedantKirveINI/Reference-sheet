import React, { useEffect } from "react";

declare global {
	interface Window {
		accessToken?: string;
	}
}

export const useAuth = () => ({
	isAuthenticated: true,
	user: null,
	token: null,
	login: () => {},
	logout: () => {},
	getAccessToken: () => Promise.resolve(""),
});

const TinyCommandAuthController = ({ children }: { children: React.ReactNode; [key: string]: any }) => {
	useEffect(() => {
		// Bypass Keycloak only in dev mode when env vars are set
		if (!import.meta.env.DEV) return;
		if (process.env.REACT_APP_BYPASS_KEYCLOAK !== "true") return;
		const token = process.env.REACT_APP_BYPASS_KEYCLOAK_TOKEN;
		if (token && token.trim()) {
			window.accessToken = token;
		}
	}, []);

	return <>{children}</>;
};

export default TinyCommandAuthController;
