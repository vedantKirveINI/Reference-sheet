import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import React from "react";

import DialogActions from "./DialogAction";
import DialogContentBody from "./DialogContent";
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
		<Dialog open={!!open} onOpenChange={(v) => !v && setOpen("")}>
			<DialogContent
				className="max-w-[39rem]"
				onKeyDown={(e) => e.stopPropagation()}
			>
				<DialogTitle />
				<DialogContentBody
					controls={controls}
					control={control}
					errors={errors}
				/>
				<DialogFooter>
					<DialogActions
						onDiscard={handleDiscard}
						onAdd={handleSubmit(onSubmit)}
						loading={loading}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default AddTable;
