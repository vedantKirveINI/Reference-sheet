import { io } from "socket.io-client";

let socketInstance = null;

const BACKEND_URL = process.env.REACT_APP_API_BASE_URL;

const getSocketInstance = () => {
	if (!socketInstance) {
		const token = window.accessToken;

		socketInstance = io(`${BACKEND_URL}`, {
			transports: ["websocket", "webtransport", "polling"],
			query: { token: token },
			timeout: 10000, // 10 seconds
		});
	}
	return socketInstance;
};

export default getSocketInstance;
