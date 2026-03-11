import React, { useEffect, useRef } from "react";
import styles from "./OptionList.module.css";

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

	// Handle mouse wheel scrolling in option list (prevents canvas scrolling)
	useEffect(() => {
		const optionContainer = optionContainerRef.current;
		if (!optionContainer) return;

		const handleWheel = (e: WheelEvent) => {
			// Stop propagation to prevent canvas scrolling
			e.stopPropagation();

			// Allow native scrolling within the container
			const { scrollTop, scrollHeight, clientHeight } = optionContainer;
			const isScrollable = scrollHeight > clientHeight;

			if (!isScrollable) {
				e.preventDefault();
				return;
			}

			// Check if we're at the boundaries
			const isAtTop = scrollTop === 0;
			const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

			if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
				// Prevent scrolling beyond boundaries
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
			className={styles.optionListContainer}
			data-opinion-scale-option-list
			onClick={(e) => e.stopPropagation()}
			onWheel={(e) => {
				// Prevent wheel events from reaching canvas
				e.stopPropagation();
			}}
		>
			<div ref={optionContainerRef} className={styles.optionContainer}>
				{options.map((value: number) => (
					<div
						key={value}
						className={`${styles.optionItem} ${
							selectedValue === value
								? styles.optionItemSelected
								: ""
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
