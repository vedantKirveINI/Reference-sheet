import isEmpty from "lodash/isEmpty";

function transformSharePermission(users = []) {
	if (isEmpty(users)) return [];

	return users
		.filter((user) => user.isModified)
		.map((user) => {
			// If role is "remove access", only include email_id and remove flag
			if (user.role.toLowerCase() === "remove access") {
				return {
					email_id: user.emailId,
					remove: true,
				};
			}

			// For all other roles, include email_id and role
			return {
				email_id: user.emailId,
				role: user.role.toUpperCase(),
			};
		});
}

export default transformSharePermission;
