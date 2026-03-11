import ODSDialog from "oute-ds-dialog";

import DialogActions from "./DialogActions";
import DialogContent from "./DialogContent";
import useBinModalHandler from "./hooks/useBinModalHandler";

function BinModal({ sheet = {} }) {
	const {
		handleGoToHome = () => {},
		handleRestoreSheet = () => {},
		loading = false,
		open = true,
	} = useBinModalHandler();

	return (
		<ODSDialog
			open={open}
			dialogWidth="50rem"
			showFullscreenIcon={false}
			hideBackdrop={false}
			draggable={false}
			dialogContent={<DialogContent sheet={sheet} />}
			removeContentPadding
			showCloseIcon={false}
			dialogActions={
				<DialogActions
					handleGoToHome={handleGoToHome}
					handleRestoreSheet={handleRestoreSheet}
					loading={loading}
				/>
			}
		/>
	);
}

export default BinModal;
