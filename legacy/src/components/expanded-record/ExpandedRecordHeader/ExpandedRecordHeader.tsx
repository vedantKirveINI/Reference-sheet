import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronUp, ChevronDown, Link, MoreHorizontal, X, Copy, Trash2 } from "lucide-react";
import styles from "./ExpandedRecordHeader.module.scss";

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
		<div className={styles.header}>
			<div className={styles.header_left}>
				<TooltipProvider>
					{onPrev && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={onPrev}
									disabled={disabledPrev}
									className="h-auto w-auto p-1"
								>
									<ChevronUp
										className="h-5 w-5"
										style={{ color: disabledPrev ? "#bdbdbd" : "#424242" }}
									/>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="top">Previous Record</TooltipContent>
						</Tooltip>
					)}
					{onNext && (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									onClick={onNext}
									disabled={disabledNext}
									className="h-auto w-auto p-1"
								>
									<ChevronDown
										className="h-5 w-5"
										style={{ color: disabledNext ? "#bdbdbd" : "#424242" }}
									/>
								</Button>
							</TooltipTrigger>
							<TooltipContent side="bottom">Next Record</TooltipContent>
						</Tooltip>
					)}
				</TooltipProvider>

				<span
					style={{ fontFamily: "Inter", marginLeft: "0.5rem" }}
					className={styles.title}
				>
					{title}
				</span>
			</div>

			<div className={styles.header_right}>
				{onCopyUrl && (
					<Button
						variant="ghost"
						size="icon"
						onClick={handleCopyUrl}
						className="h-auto w-auto p-2"
					>
						<Link className="h-4 w-4" style={{ color: "#424242" }} />
					</Button>
				)}

				{(canDelete || canDuplicate) && (
					<Popover open={menuOpen} onOpenChange={setMenuOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-auto w-auto p-2"
							>
								<MoreHorizontal className="h-4 w-4" style={{ color: "#424242" }} />
							</Button>
						</PopoverTrigger>
						<PopoverContent
							align="end"
							className="w-[180px] p-1"
						>
							{canDuplicate && onDuplicate && (
								<div
									onClick={handleDuplicate}
									className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded hover:bg-gray-100"
								>
									<Copy className="h-4 w-4" style={{ color: "#90A4AE" }} />
									<span style={{ fontFamily: "Inter", fontSize: "13px", color: "#212121" }}>
										Duplicate Record
									</span>
								</div>
							)}
							{canDelete && onDelete && (
								<div
									onClick={handleDelete}
									className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded hover:bg-gray-100"
								>
									<Trash2 className="h-4 w-4" style={{ color: "#F44336" }} />
									<span style={{ fontFamily: "Inter", fontSize: "13px", color: "#F44336" }}>
										Delete Record
									</span>
								</div>
							)}
						</PopoverContent>
					</Popover>
				)}

				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					className="h-auto w-auto p-2"
				>
					<X className="h-4 w-4" style={{ color: "#424242" }} />
				</Button>
			</div>
		</div>
	);
};
