import { io, Socket } from "socket.io-client";

// Extend global Window interface to include accessToken
declare global {
	interface Window {
		accessToken?: string;
	}
}

// Socket configuration interface
interface SocketConfig {
	transports: string[];
	query: {
		token?: string;
	};
	timeout: number;
}

let socketInstance: Socket | null = null;

const BACKEND_URL: string | undefined = process.env.REACT_APP_API_BASE_URL;

/**
 * Gets or creates a singleton Socket.IO instance
 * @returns Socket.IO client instance
 */
const getSocketInstance = (): Socket => {
	if (!socketInstance) {
		if (!BACKEND_URL) {
			throw new Error(
				"REACT_APP_API_BASE_URL environment variable is not defined",
			);
		}

		const token: string | undefined = window.accessToken;

		const config: SocketConfig = {
			transports: ["websocket", "webtransport", "polling"],
			query: { token },
			timeout: 10000, // 10 seconds
		};

		socketInstance = io(BACKEND_URL, config);
	}
	return socketInstance;
};

export default getSocketInstance;
