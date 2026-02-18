import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
		<Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
			<DialogContent className="max-w-[40rem]">
				<DialogHeader>
					<DialogTitle>
						<span className="font-[Inter] px-4 text-[#212121]">
							Window is too narrow to adjust frozen columns
						</span>
					</DialogTitle>
				</DialogHeader>
				<div>
					<span className="text-base font-[Inter] p-4 block text-[#263238]">
						You have {requestedCount} frozen column
						{requestedCount !== 1 ? "s" : ""} but only {actualCount}{" "}
						{actualCount === 1 ? "is" : "are"} appearing frozen
						right now because your window is too narrow. You can
						reset the number of frozen columns to {actualCount} to
						fix this. You can also change the number of frozen
						columns by enlarging your window or by making individual
						column widths narrower.
					</span>
				</div>
				<DialogFooter>
					<div className="flex justify-end gap-3">
						<Button
							variant="outline"
							onClick={onCancel}
							className="text-sm font-medium py-[0.4375rem] px-4 rounded-md normal-case"
						>
							Cancel
						</Button>
						<Button
							variant="default"
							onClick={onReset}
							className="text-sm font-medium py-[0.4375rem] px-4 rounded-md"
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
