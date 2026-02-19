import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import styles from "./FreezeColumnWarningModal.module.scss";

interface FreezeColumnWarningModalProps {
	open: boolean;
	requestedCount: number;
	actualCount: number;
	onReset: () => void;
	onCancel: () => void;
}

export const FreezeColumnWarningModal: React.FC<
	FreezeColumnWarningModalProps
> = ({ open, requestedCount, actualCount, onReset, onCancel }) => {
	if (!open) return null;

	return (
		<Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
			<DialogContent className="max-w-[40rem]">
				<DialogHeader>
					<DialogTitle
						style={{ fontFamily: "Inter", padding: "0rem 1rem", color: "#212121" }}
					>
						Window is too narrow to adjust frozen columns
					</DialogTitle>
				</DialogHeader>
				<div className={styles.dialog_content}>
					<p
						style={{
							fontFamily: "Inter",
							padding: "1rem",
							color: "#263238",
						}}
					>
						You have {requestedCount} frozen column
						{requestedCount !== 1 ? "s" : ""} but only {actualCount}{" "}
						{actualCount === 1 ? "is" : "are"} appearing frozen
						right now because your window is too narrow. You can
						reset the number of frozen columns to {actualCount} to
						fix this. You can also change the number of frozen
						columns by enlarging your window or by making individual
						column widths narrower.
					</p>
				</div>
				<DialogFooter>
					<div className={styles.dialog_actions}>
						<Button
							variant="outline"
							onClick={onCancel}
							style={{
								fontSize: "0.875rem",
								fontWeight: "500",
								textTransform: "none",
							}}
						>
							Cancel
						</Button>
						<Button
							onClick={onReset}
							style={{
								fontSize: "0.875rem",
								fontWeight: "500",
							}}
						>
							{`Reset to ${actualCount} frozen column${
								actualCount !== 1 ? "s" : ""
							}`}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
