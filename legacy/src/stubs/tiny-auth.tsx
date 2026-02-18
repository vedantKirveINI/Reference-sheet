import React from "react";

export const useAuth = () => ({
	isAuthenticated: true,
	user: null,
	token: null,
	login: () => {},
	logout: () => {},
	getAccessToken: () => Promise.resolve(""),
});

const TinyCommandAuthController = ({ children }: { children: React.ReactNode; [key: string]: any }) => {
	return <>{children}</>;
};

export default TinyCommandAuthController;
