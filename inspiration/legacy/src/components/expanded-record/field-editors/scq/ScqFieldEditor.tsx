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
import ODSPopper from "oute-ds-popper";
import ODSTextField from "oute-ds-text-field";
import ODSIcon from "oute-ds-icon";
import ODSRadio from "oute-ds-radio";
import styles from "./ScqFieldEditor.module.scss";

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

	// Use the same hook as grid editor for consistency
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

	// Sync with value prop changes (when record changes externally)
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

	// Filter options based on search
	const filteredOptions = useMemo(() => {
		return options.filter((option) =>
			option.toLowerCase().includes(searchValue.toLowerCase()),
		);
	}, [options, searchValue]);

	// Handle closing dropdown
	const handleCloseDropdown = useCallback(() => {
		setPopperOpen(false);
		setSearchValue("");
	}, []);

	// Close dropdown when clicking outside
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

	// Handle option selection
	const handleOptionSelect = useCallback(
		(option: string) => {
			handleSelectOption(option);
			onChange(option);
			handleCloseDropdown();
		},
		[handleSelectOption, onChange, handleCloseDropdown],
	);

	// Auto-focus search when popover opens
	useEffect(() => {
		if (popperOpen && searchFieldRef.current) {
			// Use requestAnimationFrame for instant focus (no delay)
			requestAnimationFrame(() => {
				searchFieldRef.current?.focus();
			});
		}
	}, [popperOpen]);

	// Handle mouse wheel scrolling in option list (same pattern as MCQ/SCQ cell editor)
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
		<div ref={containerRef} className={styles.scq_editor}>
			<div
				ref={inputContainerRef}
				className={styles.scq_input_container}
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

			{/* Options List - Using ODSPopper (like cell-level editors) */}
			<ODSPopper
				open={popperOpen}
				anchorEl={inputContainerRef.current}
				placement="bottom-start"
				disablePortal
				className={styles.popper_container}
			>
				<div data-scq-option-list onWheel={(e) => e.stopPropagation()}>
					<div
						className={styles.option_list_container}
						onClick={(e) => e.stopPropagation()}
					>
						{/* Search Input */}
						<div className={styles.search_container}>
							<ODSTextField
								fullWidth
								className="black"
								inputRef={searchFieldRef}
								placeholder="Find your option"
								value={searchValue}
								autoFocus
								onChange={(
									e: React.ChangeEvent<HTMLInputElement>,
								) => setSearchValue(e.target.value)}
								InputProps={{
									startAdornment: (
										<ODSIcon
											outeIconName="OUTESearchIcon"
											outeIconProps={{
												sx: {
													height: "1.25rem",
													width: "1.25rem",
													color: "#90a4ae",
												},
											}}
										/>
									),
									endAdornment: searchValue && (
										<ODSIcon
											outeIconName="OUTECloseIcon"
											outeIconProps={{
												sx: {
													height: "1.1rem",
													width: "1.1rem",
													cursor: "pointer",
												},
											}}
											buttonProps={{
												sx: { padding: 0 },
												onClick: () =>
													setSearchValue(""),
											}}
											onClick={() => setSearchValue("")}
										/>
									),
								}}
								sx={{
									width: "100%",
									".MuiInputBase-root": {
										borderRadius: "0.375rem",
									},
								}}
							/>
						</div>

						{/* Options List */}
						<div
							ref={optionContainerRef}
							className={styles.option_container}
						>
							{filteredOptions.length === 0 ? (
								<div className={styles.option_not_found}>
									No options found
								</div>
							) : (
								filteredOptions.map((option) => {
									const isSelected =
										selectedOption === option;
									return (
										<div
											key={option}
											className={
												styles.radio_option_wrapper
											}
											onClick={() =>
												handleOptionSelect(option)
											}
										>
											<ODSRadio
												labelText={option}
												labelProps={{
													variant: "subtitle1",
												}}
												formControlLabelProps={{
													value: option,
													sx: { width: "100%" },
												}}
												radioProps={{
													checked: isSelected,
													size: "small",
													onChange: () =>
														handleOptionSelect(
															option,
														),
													sx: {
														"&.Mui-checked": {
															color: "#212121",
														},
													},
												}}
											/>
										</div>
									);
								})
							)}
						</div>
					</div>
				</div>
			</ODSPopper>
		</div>
	);
};
