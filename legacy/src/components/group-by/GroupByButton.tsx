import React, { useMemo, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useGroupByPlaygroundStore } from "@/stores/groupByPlaygroundStore";
import GroupByPanel from "./GroupByPanel";
import { GROUP_COLUMN_BG } from "@/theme/grouping";

interface GroupByButtonProps {
	fields?: Array<{ id: number; name: string; type: string }>;
}

export const GroupByButton: React.FC<GroupByButtonProps> = ({
	fields = [],
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const popoverRef = useRef<HTMLDivElement | null>(null);
	const { groupConfig } = useGroupByPlaygroundStore();

	const isActive = useMemo(() => {
		return groupConfig !== null && (groupConfig.groupObjs?.length ?? 0) > 0;
	}, [groupConfig]);

	const groupText = useMemo(() => {
		if (!isActive) return "Group";
		const count = groupConfig?.groupObjs?.length ?? 0;
		return count === 1 ? "1 group" : `${count} groups`;
	}, [isActive, groupConfig]);

	const handleOpen = () => {
		setIsOpen(true);
	};

	const handleClose = () => {
		setIsOpen(false);
	};

	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(e.target as Node) &&
				buttonRef.current &&
				!buttonRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	return (
		<div className="inline-flex items-center">
			<Button
				variant="ghost"
				onClick={handleOpen}
				ref={buttonRef}
				data-testid="group-by-button-trigger"
				className="normal-case"
				style={{
					backgroundColor: isActive ? GROUP_COLUMN_BG : undefined,
					color: "#000000",
					border: isActive ? "1.5px solid #a78bfa" : undefined,
				}}
			>
				{groupText}
				<span className="text-xs ml-1 opacity-70">▾</span>
			</Button>

			{isOpen && (
				<div
					ref={popoverRef}
					className="fixed z-[200] mt-1 bg-white border border-[#e5e7eb] rounded-lg shadow-lg"
					style={{
						top: buttonRef.current
							? buttonRef.current.getBoundingClientRect().bottom
							: 0,
						left: buttonRef.current
							? buttonRef.current.getBoundingClientRect().left
							: 0,
						minWidth: "400px",
						maxWidth: "500px",
					}}
				>
					<GroupByPanel fields={fields} />
				</div>
			)}
		</div>
	);
};

export default GroupByButton;
