import { showAlert } from "oute-ds-alert";

import useRequest from "../../../hooks/useRequest";

function useInviteMembers() {
	const [{ data, loading, error }, inviteMembersTrigger] = useRequest(
		{
			method: "post",
			url: "/asset/invite_members",
		},
		{ manual: true },
	);

	const inviteMembers = async (payload) => {
		try {
			const response = await inviteMembersTrigger({
				data: payload,
			});

			return response;
		} catch (error) {
			const { isCancel } = error || {};

			if (isCancel) return;

			showAlert({
				type: "error",
				message: `${
					error?.response?.data?.message || "Could not invite members"
				}`,
			});
		}
	};

	return {
		inviteMembers,
		data,
		loading,
		error,
	};
}

export default useInviteMembers;
