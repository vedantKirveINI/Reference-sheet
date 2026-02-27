import ODSDialog from "oute-ds-dialog";

import DialogActions from "./DialogActions";
import DialogContent from "./DialogContent";
import DialogTitle from "./DialogTitle";
import useShareHandler from "./hooks/useShareHandler";

function ShareModal({ showShare = false, setShowShare }) {
	const {
		loading = false,
		handleSubmit = () => {},
		handleClose = () => {},
		users = [],
		setUsers,
		generalAccess = {},
		setGeneralAccess,
		hasModifiedUsers = false,
		membersInfoLoading = false,
		findOneAssetLoading = false,
		getMembers,
		handleCopyLink = () => {},
		isLinkCopied = false,
	} = useShareHandler({ showShare, setShowShare });

	return (
		<ODSDialog
			open={showShare}
			dialogWidth="45rem"
			showFullscreenIcon={false}
			hideBackdrop={false}
			onClose={handleClose}
			draggable={false}
			dialogTitle={<DialogTitle />}
			onKeyDown={(e) => e.stopPropagation()}
			dialogContent={
				<DialogContent
					membersInfoLoading={membersInfoLoading}
					users={users}
					setUsers={setUsers}
					getMembers={getMembers}
					generalAccess={generalAccess}
					setGeneralAccess={setGeneralAccess}
					findOneAssetLoading={findOneAssetLoading}
				/>
			}
			removeContentPadding
			dialogActions={
				<DialogActions
					handleSubmit={handleSubmit}
					hasModifiedUsers={hasModifiedUsers}
					loading={loading}
					handleCopyLink={handleCopyLink}
					isLinkCopied={isLinkCopied}
				/>
			}
		/>
	);
}

export default ShareModal;
