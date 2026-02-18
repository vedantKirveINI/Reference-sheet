import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ODSIcon from "@/lib/oute-icon";
import { Loader2 } from "lucide-react";

interface IConfirmDialogProps {
	open: boolean;
	title: string;
	description: string;
	confirmText?: string;
	cancelText?: string;
	confirmButtonVariant?: "text" | "outlined" | "contained";
	loading?: boolean;
	showIcon?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export const ConfirmDialog: React.FC<IConfirmDialogProps> = ({
	open,
	title,
	description,
	confirmText = "CONFIRM",
	cancelText = "CANCEL",
	confirmButtonVariant = "contained",
	loading = false,
	showIcon = true,
	onConfirm,
	onCancel,
}) => {
	return (
		<Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
			<DialogContent className="max-w-[32rem]">
				<DialogHeader>
					<DialogTitle>
						<div className="flex items-center gap-2">
							{showIcon && (
								<ODSIcon
									outeIconName="OUTETrashIcon"
									outeIconProps={{
										size: 24,
										className: "text-[#263238]",
									}}
								/>
							)}
							<span className="text-lg font-semibold text-[#212121] font-[Inter]">
								{title}
							</span>
						</div>
					</DialogTitle>
				</DialogHeader>
				<div className="py-5 px-1 flex justify-center">
					<span className="text-base font-[Inter]">
						{description}
					</span>
				</div>
				<DialogFooter>
					<div className="flex justify-end items-center gap-6">
						<Button
							variant="outline"
							onClick={onCancel}
							disabled={loading}
							className="text-sm font-medium px-4 py-[0.4375rem] rounded-md"
							data-testid="confirm-dialog-cancel-button"
						>
							{cancelText.toUpperCase()}
						</Button>
						<Button
							variant={
								confirmButtonVariant === "contained"
									? "destructive"
									: "default"
							}
							onClick={onConfirm}
							disabled={loading}
							className="text-sm font-medium px-4 py-[0.4375rem] rounded-md"
							data-testid="confirm-dialog-confirm-button"
						>
							{loading && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							{confirmText.toUpperCase()}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
