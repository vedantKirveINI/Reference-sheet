import ODSButton from "oute-ds-button";
import ODSLoadingButton from "oute-ds-loading-button";

const DialogActions = ({
	handleGoToHome = () => {},
	handleRestoreSheet = () => {},
	loading = false,
}) => {
	return (
		<>
			<ODSButton
				variant="black-text"
				label="GO TO HOME"
				onClick={handleGoToHome}
				disabled={loading}
			/>
			<ODSLoadingButton
				variant="black"
				label="REMOVE FROM TRASH"
				onClick={handleRestoreSheet}
				loading={loading}
			/>
		</>
	);
};

export default DialogActions;
