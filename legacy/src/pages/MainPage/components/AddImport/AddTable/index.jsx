import Dialog from "oute-ds-dialog";
import React from "react";

import DialogActions from "./DialogAction";
import DialogContent from "./DialogContent";
import DialogTitle from "./DialogTitle";
import useAddTableForm from "./hooks/useAddTableForm";

function AddTable({
	open = "addTable",
	setOpen = () => {},
	baseId = "",
	setView = () => {},
	leaveRoom = () => {},
}) {
	const {
		controls = [],
		control = {},
		handleSubmit = () => {},
		errors = {},
		onSubmit = () => {},
		handleDiscard = () => {},
		loading = false,
	} = useAddTableForm({ setOpen, baseId, setView, leaveRoom });

	return (
		<Dialog
			open={open}
			dialogWidth="39rem"
			dialogHeight="auto"
			showFullscreenIcon={false}
			onClose={() => setOpen("")}
			dialogTitle={<DialogTitle />}
			hideBackdrop={false}
			draggable={false}
			onKeyDown={(e) => e.stopPropagation()}
			dialogContent={
				<DialogContent
					controls={controls}
					control={control}
					errors={errors}
				/>
			}
			dialogActions={
				<DialogActions
					onDiscard={handleDiscard}
					onAdd={handleSubmit(onSubmit)}
					loading={loading}
				/>
			}
			removeContentPadding
		/>
	);
}

export default AddTable;
