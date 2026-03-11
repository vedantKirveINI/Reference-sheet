import ODSDialog from "oute-ds-dialog";

import Content from "./Content";

function Dashboard({
	handleAIEnrichmentClick,
	handleBlankTableClick,
	createSheetLoading = false,
}) {
	return (
		<ODSDialog
			open={true}
			dialogWidth="auto"
			dialogHeight="auto"
			showFullscreenIcon={false}
			hideBackdrop={false}
			hideHeader={true}
			showCloseIcon={false}
			draggable={false}
			dialogContent={
				<Content
					handleAIEnrichmentClick={handleAIEnrichmentClick}
					handleBlankTableClick={handleBlankTableClick}
					createSheetLoading={createSheetLoading}
				/>
			}
			removeContentPadding
		/>
	);
}

export default Dashboard;
