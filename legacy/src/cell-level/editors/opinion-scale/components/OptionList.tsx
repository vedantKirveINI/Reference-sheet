import React, { useEffect, useRef } from "react";

interface OptionListProps {
	options: number[];
	selectedValue: number | null;
	onSelectOption: (value: number) => void;
}

export const OptionList: React.FC<OptionListProps> = ({
	options,
	selectedValue,
	onSelectOption,
}) => {
	const optionContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const optionContainer = optionContainerRef.current;
		if (!optionContainer) return;

		const handleWheel = (e: WheelEvent) => {
			e.stopPropagation();

			const { scrollTop, scrollHeight, clientHeight } = optionContainer;
			const isScrollable = scrollHeight > clientHeight;

			if (!isScrollable) {
				e.preventDefault();
				return;
			}

			const isAtTop = scrollTop === 0;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

			if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
				e.preventDefault();
			}
		};

		optionContainer.addEventListener("wheel", handleWheel, {
			passive: false,
		});

		return () => {
			optionContainer.removeEventListener("wheel", handleWheel);
		};
	}, []);

	return (
		<div
			className="w-full flex flex-col"
			data-opinion-scale-option-list
			onClick={(e) => e.stopPropagation()}
			onWheel={(e) => {
				e.stopPropagation();
			}}
		>
			<div ref={optionContainerRef} className="flex flex-col max-h-80 overflow-y-auto p-1">
				{options.map((value: number) => (
					<div
						key={value}
						className={`py-2 px-3 cursor-pointer rounded-md transition-colors text-sm text-[#212121] select-none ${
							selectedValue === value
								? "bg-blue-100 font-medium hover:bg-blue-200"
								: "hover:bg-gray-100"
						}`}
						onClick={(e) => {
							e.stopPropagation();
							onSelectOption(value);
						}}
					>
						{value}
					</div>
				))}
			</div>
		</div>
	);
};
