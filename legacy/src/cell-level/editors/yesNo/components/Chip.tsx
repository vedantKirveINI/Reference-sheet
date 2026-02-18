import { FC } from "react";
import { YES_NO_COLOUR_MAPPING } from "@/constants/colours";

interface ChipProps {
	value: string | null;
	onTogglePopper: () => void;
}

export const Chip: FC<ChipProps> = ({ value, onTogglePopper }) => {
	const backgroundColor = value
		? YES_NO_COLOUR_MAPPING[value as keyof typeof YES_NO_COLOUR_MAPPING]
		: "transparent";
	const isEmpty = !value;
	const label = value ?? "Select";

	return (
		<div
			className="flex items-center w-full max-w-full overflow-hidden h-full cursor-pointer focus-visible:outline-2 focus-visible:outline-[#90caf9]"
			onClick={(event) => {
				event.stopPropagation();
				onTogglePopper();
			}}
		>
			<div
				className={`inline-flex items-center justify-start w-auto max-w-full px-3 py-[3px] rounded-xl text-[0.8125rem] leading-5 font-sans whitespace-nowrap overflow-hidden text-ellipsis flex-shrink ${
					value
						? "text-[#212121]"
						: "text-[#90a4ae] italic gap-0.5"
				}`}
				style={{ backgroundColor }}
			>
				{isEmpty ? (
					<span className="inline-flex items-center gap-0.5">
						<span className="text-[#b0bec5]">(</span>
						{label}
						<span className="text-[#b0bec5]">)</span>
					</span>
				) : (
					label
				)}
			</div>
		</div>
	);
};
