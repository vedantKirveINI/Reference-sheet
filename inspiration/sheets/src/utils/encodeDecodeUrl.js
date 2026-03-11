export const encodeParams = (data) => {
	return btoa(JSON.stringify(data));
};

export const decodeParams = (base64String = "") => {
	try {
		return JSON.parse(atob(base64String));
	} catch (error) {
		return {};
	}
};
