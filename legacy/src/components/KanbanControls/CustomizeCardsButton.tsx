import React, { useRef, useState, useEffect } from "react";
import ODSIcon from "@/lib/oute-icon";

export const CustomizeCardsButton: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLDivElement | null>(null);
	const popoverRef = useRef<HTMLDivElement | null>(null);

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
		<>
			<div
				className="flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer hover:bg-[#f5f5f5] transition-colors"
				onClick={() => setIsOpen(!isOpen)}
				ref={buttonRef}
			>
				<ODSIcon
					outeIconName="OUTESettingsIcon"
					outeIconProps={{
						className: "w-4 h-4 text-[#666]",
					}}
				/>
				<span className="text-[13px] text-[#374151] whitespace-nowrap">
					Customize cards
				</span>
			</div>

			{isOpen && (
				<div
					ref={popoverRef}
					className="fixed z-[200] mt-3.5 border border-[#CFD8DC] bg-white rounded-lg shadow-lg min-w-[250px] p-2"
					style={{
						top: buttonRef.current
							? buttonRef.current.getBoundingClientRect().bottom
							: 0,
						left: buttonRef.current
							? buttonRef.current.getBoundingClientRect().left
							: 0,
					}}
				>
					<div className="p-2 text-sm text-[#666]">
						Customize card display options
					</div>
				</div>
			)}
		</>
	);
};
