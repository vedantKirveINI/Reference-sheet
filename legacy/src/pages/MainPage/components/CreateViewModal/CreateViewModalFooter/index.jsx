import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

function CreateViewModalFooter({
	onCancel = () => {},
	onSave = () => {},
	loading = false,
	saveButtonLabel = "CREATE NEW VIEW",
}) {
	return (
		<div className="flex justify-end gap-3 px-6 py-4">
			<Button
				variant="outline"
				onClick={onCancel}
				disabled={loading}
				className="text-sm font-semibold px-5 py-2.5 rounded-lg normal-case min-w-[100px] border-[#e5e7eb] text-[#374151] hover:border-[#9ca3af] hover:bg-[#f9fafb]"
			>
				CANCEL
			</Button>
			<Button
				variant="default"
				onClick={onSave}
				disabled={loading}
				className="text-sm font-semibold px-5 py-2.5 rounded-lg normal-case min-w-[140px] bg-[#1a1a1a] hover:bg-black hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)]"
			>
				{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
				{saveButtonLabel}
			</Button>
		</div>
	);
}

export default CreateViewModalFooter;
