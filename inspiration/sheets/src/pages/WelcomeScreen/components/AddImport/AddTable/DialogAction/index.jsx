import ODSButton from "oute-ds-button";
import LoadingButton from "oute-ds-loading-button";
import React from "react";

function DialogActions({
	onDiscard = () => {},
	onAdd = () => {},
	loading = false,
}) {
	return (
		<>
			<ODSButton
				variant="black-outlined"
				label="DISCARD"
				onClick={onDiscard}
				sx={{ marginRight: "0.5rem" }}
			/>
			<LoadingButton
				variant="black"
				label="ADD"
				onClick={onAdd}
				loading={loading}
			/>
		</>
	);
}

export default DialogActions;
