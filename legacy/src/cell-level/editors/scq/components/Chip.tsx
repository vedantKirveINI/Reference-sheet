import React from "react";

interface ChipProps {
	label: string | null;
	backgroundColor: string;
	borderRadius: number;
	onTogglePopper: () => void;
}

export const Chip: React.FC<ChipProps> = ({
	label,
	backgroundColor,
	borderRadius,
	onTogglePopper,
}) => {
	return (
		<div
			className="flex items-center w-full max-w-full overflow-hidden h-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#90caf9]"
			onClick={(event) => {
				event.stopPropagation();
				onTogglePopper();
			}}
		>
			<div
				className={`font-sans text-[0.8125rem] leading-5 inline-flex items-center max-w-full whitespace-nowrap text-ellipsis overflow-hidden border-none outline-none min-h-[20px] px-2 py-0.5 ${
					label
						? "text-[var(--cell-text-primary-color,#212121)]"
						: "text-transparent p-0 min-w-0 w-full min-h-[20px]"
				}`}
				style={{
					backgroundColor: label ? backgroundColor : "transparent",
					borderRadius: `${borderRadius}px`,
				}}
			>
				{label ?? ""}
			</div>
		</div>
	);
};
