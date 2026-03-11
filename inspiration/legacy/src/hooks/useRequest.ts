import axios from "axios";
import { makeUseAxios } from "axios-hooks";

// Extend global Window interface to include accessToken
declare global {
	interface Window {
		accessToken?: string;
	}
}

const BACKEND_URL = process.env.REACT_APP_API_BASE_URL;

const instance = axios.create({
	baseURL: BACKEND_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

instance.interceptors.request.use(
	(config: any) => {
		return {
			...config,
			headers: {
				...config.headers,
				// token: window.accessToken,
				token: config.headers.token || window.accessToken,
			},
		};
	},
	(error) => {
		return Promise.reject(error);
	},
);

instance.interceptors.response.use(
	(response) => response,
	(error) => {
		// Check if the error is due to cancellation
		if (axios.isCancel(error)) {
			return Promise.reject({ isCancel: true });
		}
		// For other errors, propagate the error
		return Promise.reject(error);
	},
);

const useRequest = makeUseAxios({
	axios: instance,
});

export default useRequest;
