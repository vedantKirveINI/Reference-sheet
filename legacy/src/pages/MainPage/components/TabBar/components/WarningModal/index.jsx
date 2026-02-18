import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import ODSIcon from "@/lib/oute-icon";
import { Loader2 } from "lucide-react";

function WarningModal({ open, setOpen, loading, onSubmit }) {
	if (!open) return null;

	const isDeleteAction = open === "deleteTable";
	const isClearAction = open === "clearData";

	const title = isDeleteAction
		? "Delete table"
		: isClearAction
			? "Clear data"
			: "Confirm action";

	const question = isDeleteAction
		? "Are you sure you want to delete this table?"
		: isClearAction
			? "Are you sure you want to clear all data from this table?"
			: "Are you sure you want to proceed with this action?";

	const description = isDeleteAction
		? "This action will permanently delete the table and all of its data."
		: isClearAction
			? "This action cannot be undone and all records will be permanently deleted."
			: "This action cannot be undone.";

	const confirmLabel = isDeleteAction
		? "DELETE"
		: isClearAction
			? "CLEAR"
			: "CONFIRM";

	const handleConfirm = () => {
		onSubmit();
	};

	const handleClose = () => {
		if (!loading) {
			setOpen("");
		}
	};

	return (
		<Dialog open={!!open} onOpenChange={(v) => !v && handleClose()}>
			<DialogContent className="max-w-[32rem]">
				<DialogHeader>
					<DialogTitle>
						<div className="flex items-center gap-2">
							{isDeleteAction ? (
								<ODSIcon
									outeIconName="OUTETrashIcon"
									outeIconProps={{ size: 24 }}
								/>
							) : (
								<ODSIcon
									outeIconName="OUTECloseIcon"
									outeIconProps={{ size: 24 }}
								/>
							)}
							<span className="font-inter text-[#212121]">{title}</span>
						</div>
					</DialogTitle>
				</DialogHeader>
				<div className="py-2 min-h-[80px] flex flex-col items-start justify-center">
					<span className="font-inter font-semibold mb-2 text-[#212121]">
						{question}
					</span>
					<span className="font-inter font-normal text-sm text-[#607D8B]">
						{description}
					</span>
				</div>
				<DialogFooter>
					<div className="flex justify-end items-center gap-6">
						<Button
							variant="outline"
							onClick={handleClose}
							disabled={loading}
							className="text-sm font-semibold px-5 py-2.5 rounded-md"
						>
							CANCEL
						</Button>
						<Button
							variant={isDeleteAction || isClearAction ? "destructive" : "default"}
							onClick={handleConfirm}
							disabled={loading}
							className="text-sm font-semibold px-5 py-2.5 rounded-md"
						>
							{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
							{confirmLabel}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default WarningModal;
