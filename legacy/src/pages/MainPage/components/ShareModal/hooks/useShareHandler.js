import startCase from "lodash/startCase";
import { showAlert } from "oute-ds-alert";
import { useEffect, useState } from "react";

import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import useGetMembers from "./useGetMembers";
import useSharePermission from "./useSharePermission";
import transformSharePermission from "../utils/transformSharePermission";

import useFindOneAsset from "./useFindOneAsset";

const modifiedMembersInfo = (data) =>
	(data || []).map((member) => {
		return {
			name: member.name,
			emailId: member.email_id,
			meta: member.meta,
			state: member.state,
			role: member.role?.toLowerCase(),
			roleLabel: startCase(member.role?.toLowerCase()),
			isModified: false,
			userId: member.user_id,
			bgColor: member.bg_color,
		};
	});

const modifiedAssetInfo = (data) => {
	return {
		anyoneWithLinkCanView:
			data?.result?.general_role === "VIEWER" ? true : false,
	};
};

function useShareHandler({ showShare = false, setShowShare }) {
	const { loading, sharePermission } = useSharePermission();
	const {
		getMembers = () => {},
		data: membersInfo,
		loading: membersInfoLoading = false,
	} = useGetMembers();

	const {
		getOneAsset,
		data: assetInfo,
		findOneAssetLoading,
	} = useFindOneAsset();

	const { assetId } = useDecodedUrlParams();

	const [users, setUsers] = useState([]);
	const [generalAccess, setGeneralAccess] = useState({
		anyoneWithLinkCanView: false,
	});
	const [isLinkCopied, setIsLinkCopied] = useState(false);

	function handleClose() {
		setShowShare(false);
	}

	const handleCopyLink = async () => {
		try {
			const link = window.location.href;
			await navigator.clipboard.writeText(link);

			setIsLinkCopied(true);
			setTimeout(() => {
				setIsLinkCopied(false);
			}, 2000);
		} catch (error) {
			showAlert({
				message: "Failed to copy link",
				type: "error",
			});
		}
	};

	async function handleSubmit() {
		const payload = {
			asset_ids: [assetId],
			general_role: generalAccess.anyoneWithLinkCanView
				? "VIEWER"
				: "NONE",
			invitees: transformSharePermission(users),
		};

		try {
			await sharePermission(payload);
			handleClose();
		} catch {}
	}

	const hasModifiedMembers = users.some((user) => {
		const matchingMember = membersInfo.find(
			(member) => member?.user_id === user?.userId,
		);

		if (!matchingMember) return true; // User not found in original membersInfo → considered modified

		// Compare roles in lowercase
		return (
			user?.role?.toLowerCase() !== matchingMember?.role?.toLowerCase()
		);
	});

	const originalRole = assetInfo?.result?.general_role;
	const currentRole = generalAccess?.anyoneWithLinkCanView
		? "VIEWER"
		: "NONE";

	const hasModifiedUsers = hasModifiedMembers || originalRole !== currentRole;

	useEffect(() => {
		async function fetchMembers() {
			if (showShare) {
				const membersInfo = await getMembers(assetId);
				setUsers(modifiedMembersInfo(membersInfo));
			}
		}

		async function fetchAssetInfo() {
			if (showShare) {
				const assetInfo = await getOneAsset(assetId);
				setGeneralAccess(modifiedAssetInfo(assetInfo));
			}
		}

		fetchMembers();
		fetchAssetInfo();
	}, [showShare]);

	// when user hits Invite it should update the list of users
	useEffect(() => {
		if (membersInfo) {
			setUsers(modifiedMembersInfo(membersInfo));
		}
	}, [membersInfo]);

	return {
		loading,
		handleSubmit,
		handleClose,
		users,
		setUsers,
		generalAccess,
		setGeneralAccess,
		hasModifiedUsers,
		membersInfoLoading,
		findOneAssetLoading,
		getMembers,
		handleCopyLink,
		isLinkCopied,
	};
}

export default useShareHandler;
