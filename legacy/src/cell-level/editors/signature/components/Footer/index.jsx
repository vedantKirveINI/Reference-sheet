import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";

const Footer = ({ onClose = () => {}, onSave = () => {}, loading = false }) => {
	return (
		<div className="flex items-center p-1 gap-6">
			<Button
				variant="outline"
				onClick={onClose}
				disabled={loading}
			>
				DISCARD
			</Button>
			<Button
				variant="default"
				onClick={onSave}
				disabled={loading}
			>
				{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
				SAVE
			</Button>
		</div>
	);
};

export default Footer;
