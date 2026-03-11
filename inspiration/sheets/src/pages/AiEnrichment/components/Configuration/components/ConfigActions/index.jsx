import LoadingButton from "oute-ds-loading-button";

function ConfigActions({
	handleContinueClick,
	loading = false,
	label = "Continue",
}) {
	return (
		<LoadingButton
			variant="black"
			label={label}
			onClick={handleContinueClick}
			loading={loading}
		/>
	);
}

export default ConfigActions;
