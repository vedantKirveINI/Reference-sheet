import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import React from "react";

import DialogActionsComp from "./DialogAction";
import DialogContentComp from "./DialogContent";
import DialogTitleComp from "./DialogTitle";
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
		<Dialog open={!!open} onOpenChange={(isOpen) => { if (!isOpen) setOpen(""); }}>
			<DialogContent className="max-w-[39rem]" onKeyDown={(e) => e.stopPropagation()}>
				<DialogHeader>
					<DialogTitle>
						<DialogTitleComp />
					</DialogTitle>
				</DialogHeader>
				<DialogContentComp
					controls={controls}
					control={control}
					errors={errors}
				/>
				<DialogFooter>
					<DialogActionsComp
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
