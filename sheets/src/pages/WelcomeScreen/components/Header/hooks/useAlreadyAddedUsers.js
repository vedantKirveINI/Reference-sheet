import startCase from "lodash/startCase";
import { useState, useMemo } from "react";

const useAlreadyAddedUsers = ({ users = [], setUsers }) => {
	const [filterQuery, setFilterQuery] = useState("");

	// Filter users based on search query
	const filteredUsers = useMemo(() => {
		if (!filterQuery?.trim()) return users;

		const query = filterQuery.toLowerCase();

		return (users || []).filter(
			(user) =>
				user.name?.toLowerCase().includes(query) ||
				user.emailId?.toLowerCase().includes(query),
		);
	}, [users, filterQuery]);

	const updateUserRole = ({ userId, newRole }) => {
		setUsers((prevUsers) =>
			prevUsers.map((user) =>
				user.userId === userId
					? {
							...user,
							role: newRole,
							roleLabel: startCase(newRole?.toLowerCase()),
							isModified: true,
						}
					: user,
			),
		);
	};

	return {
		filteredUsers,
		filterQuery,
		setFilterQuery,
		updateUserRole,
	};
};

export default useAlreadyAddedUsers;
