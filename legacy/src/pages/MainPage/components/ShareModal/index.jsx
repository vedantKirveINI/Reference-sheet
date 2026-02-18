import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import DialogActionsComp from "./DialogActions";
import DialogContentComp from "./DialogContent";
import DialogTitleComp from "./DialogTitle";
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
		<Dialog open={showShare} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="max-w-[45rem]" onKeyDown={(e) => e.stopPropagation()}>
				<DialogHeader>
					<DialogTitle>
						<DialogTitleComp />
					</DialogTitle>
				</DialogHeader>
				<div className="p-0">
					<DialogContentComp
						membersInfoLoading={membersInfoLoading}
						users={users}
						setUsers={setUsers}
						getMembers={getMembers}
						generalAccess={generalAccess}
						setGeneralAccess={setGeneralAccess}
						findOneAssetLoading={findOneAssetLoading}
					/>
				</div>
				<DialogFooter>
					<DialogActionsComp
						handleSubmit={handleSubmit}
						hasModifiedUsers={hasModifiedUsers}
						loading={loading}
						handleCopyLink={handleCopyLink}
						isLinkCopied={isLinkCopied}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default ShareModal;
