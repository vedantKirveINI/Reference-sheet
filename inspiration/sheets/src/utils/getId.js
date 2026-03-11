import { jwtDecode } from "jwt-decode";

function getUserIdFromToken() {
	try {
		const accessToken = window?.accessToken;

		const decoded = jwtDecode(accessToken);

		const userId = decoded.sub;
		return userId;
	} catch (error) {
		return null;
	}
}

export { getUserIdFromToken };
