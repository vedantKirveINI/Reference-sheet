import React, {
	useState,
	useCallback,
	useRef,
	useEffect,
	useMemo,
} from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { ISCQCell } from "@/types";
import { Chip } from "@/cell-level/editors/scq/components/Chip";
import { useScqEditor } from "@/cell-level/editors/scq/hooks/useScqEditor";
import { useChipWidth } from "@/cell-level/editors/scq/hooks/useChipWidth";
import { getScqColor } from "@/cell-level/renderers/scq/utils/colorUtils";
import { Input } from "@/components/ui/input";
import ODSIcon from "@/lib/oute-icon";

export const ScqFieldEditor: React.FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const inputContainerRef = useRef<HTMLDivElement>(null);
	const optionContainerRef = useRef<HTMLDivElement>(null);
	const [popperOpen, setPopperOpen] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const searchFieldRef = useRef<HTMLInputElement>(null);

	const scqCell = cell as ISCQCell | undefined;
	const options =
		field.options ??
		(field as { rawOptions?: { options?: string[] } }).rawOptions?.options ??
		scqCell?.options?.options ??
		[];
	const initialValue = typeof value === "string" ? value : null;

	const {
		selectedOption,
		handleSelectOption,
		setSelectedOption,
		availableWidth,
		wrapClass,
	} = useScqEditor({
		initialValue,
		options,
		containerWidth: 400,
		containerHeight: 36,
	});

	useEffect(() => {
		const newValue = typeof value === "string" ? value : null;
		if (newValue !== selectedOption) {
			setSelectedOption(newValue);
		}
	}, [value]);

	const { borderRadius } = useChipWidth({
		value: selectedOption,
		availableWidth,
		wrapClass,
	});

	const filteredOptions = useMemo(() => {
		return options.filter((option) =>
			option.toLowerCase().includes(searchValue.toLowerCase()),
		);
	}, [options, searchValue]);

	const handleCloseDropdown = useCallback(() => {
		setPopperOpen(false);
		setSearchValue("");
	}, []);

	useEffect(() => {
		if (!popperOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (
				containerRef.current &&
				!containerRef.current.contains(target) &&
				!target.closest("[data-scq-option-list]")
			) {
				handleCloseDropdown();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [popperOpen, handleCloseDropdown]);

	const handleOptionSelect = useCallback(
		(option: string) => {
			handleSelectOption(option);
			onChange(option);
			handleCloseDropdown();
		},
		[handleSelectOption, onChange, handleCloseDropdown],
	);

	useEffect(() => {
		if (popperOpen && searchFieldRef.current) {
			requestAnimationFrame(() => {
				searchFieldRef.current?.focus();
			});
		}
	}, [popperOpen]);

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
	}, [popperOpen]);

	const chipColor = selectedOption
		? getScqColor(selectedOption, options)
		: "#ECEFF1";

	return (
		<div ref={containerRef} className="w-full relative min-h-[36px]">
			<div
				ref={inputContainerRef}
				className="flex justify-start items-center w-full min-h-[36px] py-1 px-2 border border-[#e0e0e0] rounded-md cursor-pointer focus-within:border-[#1976d2] focus-within:border-2 focus-within:py-[3px] focus-within:px-[7px]"
				data-testid="scq-editor-form"
			>
				<Chip
					label={selectedOption}
					backgroundColor={chipColor}
					borderRadius={borderRadius}
					onTogglePopper={() => {
						if (!readonly) {
							setPopperOpen((prev) => !prev);
							setSearchValue("");
						}
					}}
				/>
			</div>

			{popperOpen && (
				<div className="absolute z-[1001] bg-white border border-[#e0e0e0] rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] min-w-[300px] max-w-[400px] max-h-[400px]">
					<div data-scq-option-list onWheel={(e) => e.stopPropagation()}>
						<div
							className="flex flex-col max-h-[300px] p-2"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="mb-2">
								<div className="relative">
									<ODSIcon
										outeIconName="OUTESearchIcon"
										outeIconProps={{
											size: 20,
											className: "absolute left-2 top-1/2 -translate-y-1/2 text-[#90a4ae] w-5 h-5",
										}}
									/>
									<Input
										ref={searchFieldRef}
										placeholder="Find your option"
										value={searchValue}
										autoFocus
										onChange={(e) => setSearchValue(e.target.value)}
										className="pl-8 pr-8 rounded-md w-full"
									/>
									{searchValue && (
										<button
											className="absolute right-2 top-1/2 -translate-y-1/2 p-0 border-none bg-transparent cursor-pointer"
											onClick={() => setSearchValue("")}
										>
											<ODSIcon
												outeIconName="OUTECloseIcon"
												outeIconProps={{ size: 18, className: "w-[1.1rem] h-[1.1rem]" }}
											/>
										</button>
									)}
								</div>
							</div>

							<div
								ref={optionContainerRef}
								className="flex-1 max-h-[250px] overflow-y-auto py-2 w-full scrollbar-thin"
							>
								{filteredOptions.length === 0 ? (
									<div className="py-3 px-4 text-[#90a4ae] text-sm">
										No options found
									</div>
								) : (
									filteredOptions.map((option) => {
										const isSelected = selectedOption === option;
										return (
											<div
												key={option}
												className="flex items-center gap-2 py-2 px-4 cursor-pointer text-sm text-[#212121] hover:bg-[#f5f5f5]"
												onClick={() => handleOptionSelect(option)}
											>
												<div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-[#212121]" : "border-gray-300"}`}>
													{isSelected && <div className="w-2 h-2 rounded-full bg-[#212121]" />}
												</div>
												<span className="text-sm">{option}</span>
											</div>
										);
									})
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};
