import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ODSIcon from "@/lib/oute-icon";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

interface IExpandedRecordHeaderProps {
	title: string;
	onClose: () => void;
	onPrev?: () => void;
	onNext?: () => void;
	disabledPrev?: boolean;
	disabledNext?: boolean;
	onDelete?: () => void;
	onDuplicate?: () => void;
	onCopyUrl?: () => void;
	canDelete?: boolean;
	canDuplicate?: boolean;
}

export const ExpandedRecordHeader: React.FC<IExpandedRecordHeaderProps> = ({
	title,
	onClose,
	onPrev,
	onNext,
	disabledPrev = true,
	disabledNext = true,
	onDelete,
	onDuplicate,
	onCopyUrl,
	canDelete = false,
	canDuplicate = false,
}) => {
	const [menuOpen, setMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const menuButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		if (!menuOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (
				menuRef.current && !menuRef.current.contains(e.target as Node) &&
				menuButtonRef.current && !menuButtonRef.current.contains(e.target as Node)
			) {
				setMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [menuOpen]);

	const handleDelete = () => {
		setMenuOpen(false);
		onDelete?.();
	};

	const handleDuplicate = () => {
		setMenuOpen(false);
		onDuplicate?.();
	};

	const handleCopyUrl = () => {
		setMenuOpen(false);
		onCopyUrl?.();
	};

	return (
		<div className="flex items-center justify-between w-full">
			<div className="flex items-center gap-2 flex-1 min-w-0">
				{onPrev && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={onPrev}
									disabled={disabledPrev}
									className="min-w-0 p-1 h-auto"
								>
									<ODSIcon
										outeIconName="OUTEKeyboardArrowUpIcon"
										outeIconProps={{
											size: 20,
											className: disabledPrev ? "text-[#bdbdbd]" : "text-[#424242]",
										}}
									/>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top"><p>Previous Record</p></TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}
				{onNext && (
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={onNext}
									disabled={disabledNext}
									className="min-w-0 p-1 h-auto"
								>
									<ODSIcon
										outeIconName="OUTEExpandMoreIcon"
										outeIconProps={{
											size: 20,
											className: disabledNext ? "text-[#bdbdbd]" : "text-[#424242]",
										}}
									/>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom"><p>Next Record</p></TooltipContent>
						</Tooltip>
					</TooltipProvider>
				)}

				<span className="text-lg font-semibold font-[Inter] ml-2 overflow-hidden text-ellipsis whitespace-nowrap min-w-0 md:text-base">
					{title}
				</span>
			</div>

			<div className="flex items-center gap-2">
				{onCopyUrl && (
					<Button
						variant="ghost"
						size="icon"
						onClick={handleCopyUrl}
						className="min-w-0 p-2 h-auto"
					>
						<ODSIcon
							outeIconName="OUTELinkIcon"
							outeIconProps={{ size: 16, className: "text-[#424242]" }}
						/>
					</Button>
				)}

				{(canDelete || canDuplicate) && (
					<div className="relative">
						<Button
							ref={menuButtonRef}
							variant="ghost"
							size="icon"
							onClick={() => setMenuOpen(!menuOpen)}
							className="min-w-0 p-2 h-auto"
						>
							<ODSIcon
								outeIconName="OUTEMoreHorizIcon"
								outeIconProps={{ size: 16, className: "text-[#424242]" }}
							/>
						</Button>
						{menuOpen && (
							<div
								ref={menuRef}
								className="absolute right-0 top-full z-50 min-w-[180px] py-1 bg-white rounded-md shadow-[0px_4px_6px_rgba(0,0,0,0.1)] border border-gray-200"
							>
								{canDuplicate && onDuplicate && (
									<button
										onClick={handleDuplicate}
										className="flex items-center w-full px-3 py-2 min-h-[36px] hover:bg-[#f5f5f5] text-left"
									>
										<span className="min-w-[32px] flex items-center">
											<ODSIcon outeIconName="OUTEContentCopyIcon" outeIconProps={{ size: 16, className: "text-[#90A4AE]" }} />
										</span>
										<span className="font-[Inter] text-[13px] font-normal text-[#212121]">Duplicate Record</span>
									</button>
								)}
								{canDelete && onDelete && (
									<button
										onClick={handleDelete}
										className="flex items-center w-full px-3 py-2 min-h-[36px] hover:bg-[#f5f5f5] text-left"
									>
										<span className="min-w-[32px] flex items-center">
											<ODSIcon outeIconName="OUTEDeleteIcon" outeIconProps={{ size: 16, className: "text-[#F44336]" }} />
										</span>
										<span className="font-[Inter] text-[13px] font-normal text-[#F44336]">Delete Record</span>
									</button>
								)}
							</div>
						)}
					</div>
				)}

				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					className="min-w-0 p-2 h-auto"
				>
					<ODSIcon
						outeIconName="OUTECloseIcon"
						outeIconProps={{ size: 16, className: "text-[#424242]" }}
					/>
				</Button>
			</div>
		</div>
	);
};
