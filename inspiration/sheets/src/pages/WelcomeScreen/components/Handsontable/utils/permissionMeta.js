export const getPermission = () => {
	const permissionMeta = localStorage.getItem("permissionMeta");
	if (!permissionMeta) return {};

	try {
		const parsedPermissionMeta = JSON.parse(permissionMeta);
		return parsedPermissionMeta;
	} catch (error) {
		setPermissionMeta({ permissionMeta: {} });
		return {};
	}
};

export const setPermissionMeta = ({ permissionMeta = {} }) => {
	if (permissionMeta === null) {
		resetPermissionMeta();
		return;
	}

	if (typeof permissionMeta === "object") {
		localStorage.setItem("permissionMeta", JSON.stringify(permissionMeta));
	}
};

export const resetPermissionMeta = () => {
	localStorage.removeItem("permissionMeta");
};
