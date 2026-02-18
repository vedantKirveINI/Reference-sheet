import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";

const Footer = ({ onSave, onClose, loading }) => {
	return (
		<div className="flex gap-2.5 items-center justify-end py-3.5 px-6 border-t-2 border-[#e5e7eb] bg-white">
			<Button
				disabled={loading}
				variant="outline"
				onClick={onClose}
				className="font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[0.8125rem] font-medium normal-case rounded-md py-[0.4375rem] px-4 min-w-[5rem] h-8 border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb] hover:border-[#d1d5db]"
			>
				DISCARD
			</Button>
			<Button
				variant="default"
				onClick={onSave}
				disabled={loading}
				className="font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] text-[0.8125rem] font-medium normal-case rounded-md py-[0.4375rem] px-4 min-w-[5rem] h-8 bg-[#1f2937] text-white shadow-[0_0.0625rem_0.1875rem_rgba(0,0,0,0.1)] hover:bg-[#111827] hover:shadow-[0_0.125rem_0.375rem_rgba(0,0,0,0.15)]"
			>
				{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				SAVE
			</Button>
		</div>
	);
};

export default Footer;
