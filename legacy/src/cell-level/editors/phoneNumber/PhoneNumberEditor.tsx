/**
 * Phone Number Cell Editor Component
 *
 * PATTERN REFERENCE: This editor follows the same pattern as StringEditor and McqEditor
 * Use this as a reference when creating new cell editors.
 *
 * KEY PATTERNS:
 * 1. SAVING LOGIC: onChange is called ONLY on save events (Enter/Tab/blur), NOT on every change
 * 2. POSITIONING: Matches StringEditor's border alignment
 * 3. KEYBOARD HANDLING: Enter/Tab for save, Escape for cancel
 * 4. BLUR HANDLING: Save on blur, but check if focus is moving within editor
 * 5. EVENT PROPAGATION: Stop propagation to prevent canvas scrolling/interaction
 */
import React, { useRef, useCallback, useEffect, useMemo } from "react";
import Icon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import type { IPhoneNumberCell } from "@/types";
import { FOOTER_HEIGHT } from "@/config/grid";
import { CountryList } from "./components/CountryList";
import { usePhoneNumberEditor } from "./hooks/usePhoneNumberEditor";
import {
	getCountry,
	getFlagUrl,
} from "../../renderers/phoneNumber/utils/countries";
import styles from "./PhoneNumberEditor.module.css";

interface PhoneNumberEditorProps {
	cell: IPhoneNumberCell;
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: any) => void; // Match GridView's onChange signature
	onSave?: () => void;
	onCancel?: () => void;
	onEnterKey?: (shiftKey: boolean) => void;
}

const PADDING_WIDTH = 8;
const PADDING_HEIGHT = 4;

export const PhoneNumberEditor: React.FC<PhoneNumberEditorProps> = ({
	cell,
	rect,
	theme,
	onChange,
	onSave,
	onCancel,
	onEnterKey,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const countryInputRef = useRef<HTMLDivElement>(null);

	// Parse initial value from cell data
	const initialValue = cell?.data || null;

	/**
	 * PATTERN: Local state management hook
	 * - Updates local state immediately for UI feedback
	 * - Does NOT call onChange (that's handled on save events)
	 * - Matches StringEditor pattern exactly
	 */
	const {
		currentValue,
		search,
		popover,
		pattern,
		phoneNumberInputRef,
		selectedCountryRef,
		searchFieldRef,
		filteredCountries,
		setSearch,
		setPopover,
		handlePhoneNumberChange,
		handleCountryClick,
		handleInputFocus,
	} = usePhoneNumberEditor({
		initialValue,
		containerWidth: rect.width,
		containerHeight: rect.height,
	});

	/**
	 * PATTERN: Keyboard event handler (matches StringEditor pattern)
	 * - Enter: Save value and navigate to next cell
	 * - Tab: Save value and navigate
	 * - Escape: Cancel editing (discard changes)
	 *
	 * NOTE: onChange is called here (on save), NOT on every input change
	 * This matches StringEditor's pattern of calling onChange only on save events
	 */
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// Don't handle Enter if popover is open (let user select country)
			if (e.key === "Enter" && !popover) {
				e.preventDefault();
				e.stopPropagation();
				// PATTERN: Save value before closing (matches StringEditor)
				// Only save if phone number has value
				if (currentValue.phoneNumber) {
					onChange(currentValue);
				} else {
					onChange(null);
				}
				onSave?.();
				// Trigger navigation if onEnterKey is provided
				if (onEnterKey) {
					requestAnimationFrame(() => {
						onEnterKey(e.shiftKey);
					});
				}
			} else if (e.key === "Tab") {
				e.preventDefault();
				e.stopPropagation();
				// PATTERN: Save value before closing (matches StringEditor)
				if (currentValue.phoneNumber) {
					onChange(currentValue);
				} else {
					onChange(null);
				}
				onSave?.();
				// Tab navigation would be handled by keyboard hook
			} else if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				onCancel?.();
			}
		},
		[popover, onSave, onCancel, onEnterKey, onChange, currentValue],
	);

	/**
	 * PATTERN: Blur event handler (matches StringEditor pattern)
	 * - Checks if focus is moving within editor (don't close if it is)
	 * - Saves value when focus moves outside editor
	 * - Uses setTimeout to check focus after event propagation (like StringEditor)
	 */
	const handleBlur = useCallback(() => {
		// PATTERN: Use setTimeout to check focus after event propagation
		// This prevents blur when clicking inside editor or scrolling (matches StringEditor)
		setTimeout(() => {
			const activeElement = document.activeElement;
			if (
				containerRef.current &&
				(containerRef.current === activeElement ||
					containerRef.current.contains(activeElement))
			) {
				// Focus is still within editor, don't blur
				return;
			}

			// Focus moved outside, save and close (matches StringEditor pattern)
			if (currentValue.phoneNumber) {
				onChange(currentValue);
			} else {
				onChange(null);
			}
			onSave?.();
		}, 0);
	}, [onSave, onChange, currentValue]);

	/**
	 * PATTERN: Prevent blur during mouse interactions (matches StringEditor)
	 * Stops event propagation to prevent canvas from handling the event
	 */
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent event bubbling to grid (like StringEditor)
		// Don't preventDefault - allow normal interactions within editor
	}, []);

	/**
	 * PATTERN: Editor positioning and styling (matches StringEditor exactly)
	 * - width + 4: Adds 4px for 2px border on each side
	 * - height + 4: Adds 4px for 2px border on top/bottom
	 * - marginLeft/Top -2: Offsets by border width to align border with cell
	 * This ensures perfect alignment with the cell renderer
	 */
	const editorStyle: React.CSSProperties = {
		position: "absolute",
		left: `${rect.x}px`,
		top: `${rect.y}px`,
		width: `${rect.width + 4}px`, // Add 4px for 2px border on each side (like StringEditor)
		height: `${rect.height + 4}px`, // Add 4px for 2px border on top/bottom (like StringEditor)
		marginLeft: -2, // Offset by border width to align with cell (like StringEditor)
		marginTop: -2, // Offset by border width to align with cell (like StringEditor)
		zIndex: 1000,
		backgroundColor: theme.cellBackgroundColor,
		border: `2px solid ${theme.cellActiveBorderColor}`,
		borderRadius: "2px",
		padding: `${PADDING_HEIGHT}px ${PADDING_WIDTH}px`,
		boxSizing: "border-box",
		pointerEvents: "auto", // Allow interaction with editor (like StringEditor)
	};

	// Get country info for display
	const country = getCountry(currentValue.countryCode);

	// Calculate optimal placement based on available space
	// Inspired by Teable's use-grid-popup-position hook
	// Uses rect coordinates which are already in viewport space (fixed position)
	const popoverPlacement = useMemo(() => {
		if (!popover) return "bottom-start"; // Default when closed

		const screenHeight = window.innerHeight;

		// rect.y is the top of the editor in viewport coordinates
		// rect.height is the editor height
		// Country input is at the top of the editor, so anchor is approximately at rect.y
		const anchorY = rect.y;

		// Calculate available space below (accounting for footer)
		const spaceBelow =
			screenHeight - anchorY - rect.height - FOOTER_HEIGHT - 8; // 8px padding

		// Calculate available space above
		const spaceAbove = anchorY - 8; // 8px padding

		// Estimated popover height (search + max 8-10 countries visible)
		const estimatedPopoverHeight = 300;

		// If there's not enough space below, prioritize opening upwards
		if (spaceBelow < estimatedPopoverHeight && spaceAbove > spaceBelow) {
			return "top-start";
		}

		// Default: open below
		return "bottom-start";
	}, [rect.x, rect.y, rect.width, rect.height, popover]);

	// Calculate fallback placements based on available space
	const fallbackPlacements = useMemo(() => {
		if (!popover) {
			return [
				"top-start",
				"top-end",
				"bottom-start",
				"bottom-end",
				"left-start",
				"right-start",
			];
		}

		const screenHeight = window.innerHeight;
		const screenWidth = window.innerWidth;

		const anchorY = rect.y;
		const anchorX = rect.x;

		const spaceBelow =
			screenHeight - anchorY - rect.height - FOOTER_HEIGHT - 8;
		const spaceAbove = anchorY - 8;
		const spaceRight = screenWidth - anchorX - rect.width - 8;
		const spaceLeft = anchorX - 8;

		// Prioritize placements based on available space
		const placements: string[] = [];

		// If more space above, prioritize top placements
		if (spaceAbove > spaceBelow) {
			placements.push("top-start", "top-end");
			placements.push("bottom-start", "bottom-end");
		} else {
			// Default: prioritize bottom placements
			placements.push("bottom-start", "bottom-end");
			placements.push("top-start", "top-end");
		}

		// Add side placements as fallback
		if (spaceRight > spaceLeft) {
			placements.push("right-start", "left-start");
		} else {
			placements.push("left-start", "right-start");
		}

		return placements;
	}, [rect.x, rect.y, rect.width, rect.height, popover]);

	return (
		<div
			ref={containerRef}
			className={styles.phone_number_container}
			style={editorStyle}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown} // PATTERN: Prevent blur on click (matches StringEditor)
			tabIndex={-1}
			data-editor-container
		>
			<div className={styles.phone_number_input_container}>
				{/* Country selector */}
				<div
					ref={countryInputRef}
					className={styles.country_input_container}
					onClick={() => {
						setPopover((prev) => !prev);
					}}
					data-testid="phone-number-editor-country-input"
				>
					{country && (
						<img
							className={styles.country_flag}
							src={getFlagUrl(country.countryCode)}
							alt={country.countryName}
							loading="lazy"
						/>
					)}

					{currentValue.countryNumber && (
						<span className={styles.country_number}>
							+{currentValue.countryNumber}
						</span>
					)}

					{/* Expand icon */}
					<Icon
						className={styles.expand_icon}
						outeIconName={
							popover
								? "OUTEExpandLessIcon"
								: "OUTEExpandMoreIcon"
						}
						outeIconProps={{
							sx: {
								width: "0.9375rem",
								height: "0.9375rem",
								color: "#000",
							},
						}}
					/>
				</div>

				{/* Vertical line separator */}
				<div className={styles.vertical_line} />

				{/* Phone number input */}
				<input
					ref={phoneNumberInputRef}
					type="text"
					placeholder={pattern || "299"}
					value={currentValue.phoneNumber || ""}
					onChange={handlePhoneNumberChange}
					onFocus={handleInputFocus}
					className={styles.phone_number_input}
					name="phoneNumber"
				/>
			</div>

			{/* Country list popover */}
			<ODSPopper
				open={popover}
				anchorEl={countryInputRef.current}
				placement={popoverPlacement}
				disablePortal
				modifiers={[
					{
						name: "preventOverflow",
						options: {
							boundary: "viewport",
							padding: 8,
							altBoundary: true,
						},
					},
					{
						name: "flip",
						options: {
							fallbackPlacements: fallbackPlacements,
							boundary: "viewport",
							padding: 8,
						},
					},
					{
						name: "offset",
						options: {
							offset: [0, 8],
						},
					},
				]}
			>
				<div
					className={styles.popover_container}
					onMouseDown={(e) => e.stopPropagation()}
					style={{
						width: `${Math.max(rect.width, 250)}px`,
					}}
				>
					<CountryList
						filteredCountries={filteredCountries}
						selectedCountryCode={currentValue.countryCode}
						search={search}
						searchFieldRef={searchFieldRef}
						onCountryClick={handleCountryClick}
						selectedCountryRef={selectedCountryRef}
						onSearchChange={setSearch}
						showCountryNumber={true}
					/>
				</div>
			</ODSPopper>
		</div>
	);
};
