import React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import styles from "./ConfirmDialog.module.scss";

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
		<Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) onCancel(); }}>
			<DialogContent className="max-w-[32rem]">
				<DialogHeader>
					<DialogTitle>
						<div className={styles.dialog_title}>
							{showIcon && (
								<Trash2
									style={{
										width: "1.5rem",
										height: "1.5rem",
										color: "#263238",
									}}
								/>
							)}
							<span
								style={{ fontFamily: "Inter", color: "#212121" }}
							>
								{title}
							</span>
						</div>
					</DialogTitle>
				</DialogHeader>
				<div className={styles.dialog_content}>
					<p style={{ fontFamily: "Inter" }}>
						{description}
					</p>
				</div>
				<DialogFooter>
					<div className={styles.dialog_actions}>
						<Button
							variant="outline"
							onClick={onCancel}
							disabled={loading}
							data-testid="confirm-dialog-cancel-button"
							style={{
								fontSize: "0.875rem",
								fontWeight: "500",
								textTransform: "none",
							}}
						>
							{cancelText.toUpperCase()}
						</Button>
						<Button
							variant={confirmButtonVariant === "contained" ? "destructive" : "outline"}
							onClick={onConfirm}
							disabled={loading}
							data-testid="confirm-dialog-confirm-button"
							style={{
								fontSize: "0.875rem",
								fontWeight: "500",
								textTransform: "none",
							}}
						>
							{loading ? "..." : confirmText.toUpperCase()}
						</Button>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
