import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import React from "react";

function DialogActions({
	onDiscard = () => {},
	onAdd = () => {},
	loading = false,
}) {
	return (
		<div className="flex justify-end items-center px-2 py-0 gap-5">
			<Button
				variant="outline"
				onClick={onDiscard}
				className="text-sm font-medium px-4 py-[7px] rounded-md mr-2"
			>
				DISCARD
			</Button>
			<Button
				variant="default"
				onClick={onAdd}
				disabled={loading}
				className="text-sm font-medium px-4 py-[7px] rounded-md"
			>
				{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				ADD
			</Button>
		</div>
	);
}

export default DialogActions;
