import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function RenameTableModalFooter({
	onCancel = () => {},
	onSave = () => {},
	loading = false,
}) {
	return (
		<div className="flex justify-end gap-4 px-2 max-[600px]:px-4 max-[600px]:py-2 max-[600px]:gap-2">
			<Button
				variant="outline"
				onClick={onCancel}
				disabled={loading}
				className="text-sm font-medium px-4 py-[7px] rounded-md normal-case"
			>
				CANCEL
			</Button>
			<Button
				variant="default"
				onClick={onSave}
				disabled={loading}
				className="text-sm font-medium px-4 py-[7px] rounded-md normal-case"
			>
				{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				SAVE
			</Button>
		</div>
	);
}

export default RenameTableModalFooter;
