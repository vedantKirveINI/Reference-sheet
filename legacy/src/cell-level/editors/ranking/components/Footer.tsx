/**
 * Footer Component for Ranking Dialog
 * Inspired by sheets project's Footer
 */
import React from "react";
import { Button } from "@/components/ui/button";

interface FooterProps {
	handleClose?: () => void;
	handleSave?: () => void;
	disabled?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
	handleClose = () => {},
	handleSave = () => {},
	disabled = false,
}) => {
	return (
		<div className="flex items-center p-1 gap-6">
			<Button
				variant="outline"
				onClick={handleClose}
			>
				DISCARD
			</Button>
			<Button
				variant="default"
				onClick={handleSave}
				disabled={disabled}
			>
				SAVE
			</Button>
		</div>
	);
};
