import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ODSIcon from "@/lib/oute-icon";

import ComingSoonTag from "../../../../../../components/common/ComingSoonTag";
import { importOptions } from "../../configuration/importOptions";

function ImportSubmenu({
	open = false,
	anchorPosition = null,
	onClose = () => {},
	setImportSource = () => {},
	setImportModalOpen = () => {},
}) {
	if (!open || !anchorPosition) return null;

	return (
		<Popover open={open} onOpenChange={(v) => !v && onClose()}>
			<PopoverTrigger asChild>
				<span
					style={{
						position: "fixed",
						left: anchorPosition ? `${anchorPosition.left}px` : 0,
						top: anchorPosition ? `${anchorPosition.top}px` : 0,
						width: 0,
						height: 0,
						pointerEvents: "none",
					}}
				/>
			</PopoverTrigger>
			<PopoverContent className="min-w-[200px] p-1 rounded-lg border border-gray-200 bg-white shadow-lg" align="start">
				{importOptions.map((option, index) => {
					const rightAdornments = [];
					if (option.hasTeamBadge) {
						rightAdornments.push(
							<div
								key="team-badge"
								className="inline-flex items-center bg-[#1976d2] text-white px-1.5 py-0.5 rounded-[10px] text-[10px] font-medium font-[Inter,sans-serif]"
							>
								Team
							</div>,
						);
					}
					if (option.hasComingSoon) {
						rightAdornments.push(
							<ComingSoonTag
								key="coming-soon"
								text="Coming soon"
								variant="gray"
							/>,
						);
					}

					return (
						<div key={option.id}>
							<button
								className="flex items-center justify-between w-full px-4 py-2 text-[13px] font-normal text-[#212121] rounded-md hover:bg-gray-100 text-left cursor-pointer"
								onClick={() => {
									onClose();
									option.handler(setImportSource, setImportModalOpen);
								}}
							>
								<div className="flex items-center flex-1">
									<span className="min-w-[32px]">
										<ODSIcon
											outeIconName={option.iconName}
											outeIconProps={{
												className: "w-4 h-4 text-[#90A4AE]",
											}}
										/>
									</span>
									<span className="font-inter font-normal text-[13px] text-[#212121]">
										{option.label}
									</span>
								</div>
								{rightAdornments.length > 0 && (
									<div className="flex items-center ml-2 gap-1">
										{rightAdornments}
									</div>
								)}
							</button>
						</div>
					);
				})}
			</PopoverContent>
		</Popover>
	);
}

export default ImportSubmenu;
