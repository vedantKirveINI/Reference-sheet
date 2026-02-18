import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const SortFooter = ({
	onSort = () => {},
	onClose = () => {},
	loading = false,
}) => {
	return (
		<div className="flex w-full p-5 items-center justify-end gap-4 box-border border-t border-[#cfd8dc]">
			<Button
				variant="outline"
				onClick={onClose}
				className="text-sm font-medium py-[0.4375rem] px-4 rounded-md normal-case"
			>
				CANCEL
			</Button>
			<Button
				variant="default"
				onClick={onSort}
				disabled={loading}
				className="text-sm font-medium py-[0.4375rem] px-4 rounded-md normal-case"
			>
				{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				SORT
			</Button>
		</div>
	);
};

export default SortFooter;
