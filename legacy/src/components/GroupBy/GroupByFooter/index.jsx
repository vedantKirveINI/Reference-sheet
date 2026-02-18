import React from "react";
import { Button } from "@/components/ui/button";

function GroupByFooter({
	onGroupBy = () => {},
	onClose = () => {},
	loading = false,
}) {
	return (
		<div className="p-4 px-5 border-t border-[#cfd8dc] flex justify-end items-center">
			<Button
				variant="outline"
				size="sm"
				onClick={onClose}
				disabled={loading}
				className="mr-2 normal-case border-[#CFD8DC] text-[var(--cell-text-primary-color)] hover:border-[#CFD8DC]"
			>
				Cancel
			</Button>
			<Button
				variant="default"
				size="sm"
				onClick={onGroupBy}
				disabled={loading}
				className="normal-case bg-[#212121] hover:bg-[#212121]"
			>
				Apply
			</Button>
		</div>
	);
}

export default GroupByFooter;
