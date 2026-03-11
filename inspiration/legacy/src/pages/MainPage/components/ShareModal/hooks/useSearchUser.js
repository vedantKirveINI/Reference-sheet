import debounce from "lodash/debounce";
import isEmpty from "lodash/isEmpty";
import { useState, useCallback } from "react";

import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import useInviteMembers from "./useInviteMembers";
import useSearchUsersSdk from "./useSearchUsersSdk";
import ROLE_OPTIONS from "../constant";

const useSearchUser = ({ getMembers }) => {
	const [searchResults, setSearchResults] = useState([]);
	const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0]);
	const [value, setValue] = useState([]);
	const [notifyInvitedUsers, setNotifyInvitedUsers] = useState(true);

	const { getUsers } = useSearchUsersSdk();

	const { workspaceId, tableId, assetId: baseId } = useDecodedUrlParams();

	const { loading: inviteMembersLoading, inviteMembers } = useInviteMembers();

	// Debounced search function to avoid excessive API calls
	const debouncedSearch = useCallback(
		debounce(async (query) => {
			if (!query.trim()) {
				setSearchResults([]); // Clear results if search is empty
				return;
			}

			try {
				const response = await getUsers(query);

				const { status = "", result = {} } = response || {};

				if (status === "success") {
					const { docs = [] } = result || {};
					setSearchResults(docs);
				}
			} catch {
				setSearchResults([]);
			}
		}, 300), // 300ms debounce to avoid excessive API calls
		[],
	);

	const handleSearchQueryChange = (query) => {
		debouncedSearch(query);
	};

	const addUserToTable = async (usersToInvite = [], role) => {
		try {
			const invitees = usersToInvite.map((user) => ({
				email_id: user?.email_id,
				role: role?.toUpperCase(),
			}));

			await inviteMembers({
				workspace_id: workspaceId,
				table_id: tableId,
				notify: notifyInvitedUsers,
				asset_ids: [baseId],
				invitees,
			});

			await getMembers(baseId);
		} catch {}
	};

	const handleInvite = async () => {
		if (!isEmpty(value)) {
			await addUserToTable(value, selectedRole?.value);
			setValue([]);
		}
	};

	return {
		setSearchQuery: handleSearchQueryChange,
		searchResults,
		addUserToTable,
		value,
		setValue,
		setSearchResults,
		inviteMembersLoading,
		selectedRole,
		setSelectedRole,
		handleInvite,
		notifyInvitedUsers,
		setNotifyInvitedUsers,
	};
};

export default useSearchUser;
