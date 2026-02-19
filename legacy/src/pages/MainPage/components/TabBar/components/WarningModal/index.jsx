import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, X } from "lucide-react";

import styles from "./styles.module.scss";

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
		<Dialog open={!!open} onOpenChange={(isOpen) => { if (!isOpen) handleClose(); }}>
			<DialogContent className="max-w-[32rem]">
				<DialogHeader>
					<DialogTitle>
						<div className={styles.dialog_title}>
							{isDeleteAction ? (
								<Trash2
									style={{
										width: "1.5rem",
										height: "1.5rem",
										color: "#263238",
									}}
								/>
							) : (
								<X
									style={{
										width: "1.5rem",
										height: "1.5rem",
										color: "#263238",
									}}
								/>
							)}
							<span style={{ fontFamily: "Inter", color: "#212121" }}>
								{title}
							</span>
						</div>
					</DialogTitle>
				</DialogHeader>
				<div className={styles.dialog_content}>
					<p
						style={{
							fontFamily: "Inter",
							fontWeight: "600",
							marginBottom: "0.5rem",
							color: "#212121",
						}}
					>
						{question}
					</p>
					<p
						style={{
							fontFamily: "Inter",
							fontWeight: "400",
							fontSize: "0.875rem",
							color: "#607D8B",
						}}
					>
						{description}
					</p>
				</div>
				<DialogFooter>
					<div className={styles.dialog_actions}>
						<Button
							variant="outline"
							onClick={handleClose}
							disabled={loading}
							style={{
								fontSize: "0.875rem",
								fontWeight: "600",
								textTransform: "none",
							}}
						>
							CANCEL
						</Button>
						<Button
							variant={
								isDeleteAction || isClearAction
									? "destructive"
									: "default"
							}
							onClick={handleConfirm}
							disabled={loading}
							style={{
								fontSize: "0.875rem",
								fontWeight: "600",
								textTransform: "none",
							}}
						>
							{loading ? "..." : confirmLabel}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default WarningModal;
