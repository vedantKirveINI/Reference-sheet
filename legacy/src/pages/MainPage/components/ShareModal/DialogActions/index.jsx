import { Button } from "@/components/ui/button";
import ODSIcon from "@/lib/oute-icon";
import { Loader2 } from "lucide-react";

function DialogActions({
	handleSubmit = () => {},
	hasModifiedUsers = false,
	loading = false,
	handleCopyLink = () => {},
	isLinkCopied = false,
}) {
	return (
		<div className="flex justify-between items-center w-full px-6 pl-4">
			<div className="flex items-center">
				{isLinkCopied ? (
					<div className="flex items-center gap-3">
						<ODSIcon
							outeIconName="OUTEDoneIcon"
							outeIconProps={{
								className: "text-[#29CC6A]",
							}}
						/>
						<span className="text-xs uppercase tracking-wider text-[#212121]">
							Link copied to your clipboard
						</span>
					</div>
				) : (
					<Button
						variant="ghost"
						data-testid="copy-link-button"
						disabled={loading}
						onClick={handleCopyLink}
					>
						<ODSIcon
							outeIconName="OUTEInsertLinkIcon"
							outeIconProps={{
								className: "text-[#212121]",
							}}
						/>
						COPY LINK
					</Button>
				)}
			</div>

			<div className="flex gap-6 items-center">
				{hasModifiedUsers && (
					<span className="text-sm text-[#607D8B]">
						Pending changes
					</span>
				)}

				<Button
					variant="default"
					disabled={!hasModifiedUsers || loading}
					onClick={handleSubmit}
				>
					{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					SAVE
				</Button>
			</div>
		</div>
	);
}

export default DialogActions;
