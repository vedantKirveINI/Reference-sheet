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
import { Icon } from "@/lib/oute-icon";
import type { IPhoneNumberCell } from "@/types";
import { FOOTER_HEIGHT } from "@/config/grid";
import { CountryList } from "./components/CountryList";
import { usePhoneNumberEditor } from "./hooks/usePhoneNumberEditor";
import {
	getCountry,
	getFlagUrl,
} from "../../renderers/phoneNumber/utils/countries";

interface PhoneNumberEditorProps {
	cell: IPhoneNumberCell;
	rect: { x: number; y: number; width: number; height: number };
	theme: any;
	isEditing: boolean;
	onChange: (value: any) => void;
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

	const initialValue = cell?.data || null;

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

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && !popover) {
				e.preventDefault();
				e.stopPropagation();
				if (currentValue.phoneNumber) {
					onChange(currentValue);
				} else {
					onChange(null);
				}
				onSave?.();
				if (onEnterKey) {
					requestAnimationFrame(() => {
						onEnterKey(e.shiftKey);
					});
				}
			} else if (e.key === "Tab") {
				e.preventDefault();
				e.stopPropagation();
				if (currentValue.phoneNumber) {
					onChange(currentValue);
				} else {
					onChange(null);
				}
				onSave?.();
			} else if (e.key === "Escape") {
				e.preventDefault();
				e.stopPropagation();
				onCancel?.();
			}
		},
		[popover, onSave, onCancel, onEnterKey, onChange, currentValue],
	);

	const handleBlur = useCallback(() => {
		setTimeout(() => {
			const activeElement = document.activeElement;
			if (
				containerRef.current &&
				(containerRef.current === activeElement ||
					containerRef.current.contains(activeElement))
			) {
				return;
			}

			if (currentValue.phoneNumber) {
				onChange(currentValue);
			} else {
				onChange(null);
			}
			onSave?.();
		}, 0);
	}, [onSave, onChange, currentValue]);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
	}, []);

	const editorStyle: React.CSSProperties = {
		position: "absolute",
		left: `${rect.x}px`,
		top: `${rect.y}px`,
		width: `${rect.width + 4}px`,
		height: `${rect.height + 4}px`,
		marginLeft: -2,
		marginTop: -2,
		zIndex: 1000,
		backgroundColor: theme.cellBackgroundColor,
		border: `2px solid ${theme.cellActiveBorderColor}`,
		borderRadius: "2px",
		padding: `${PADDING_HEIGHT}px ${PADDING_WIDTH}px`,
		boxSizing: "border-box",
		pointerEvents: "auto",
	};

	const country = getCountry(currentValue.countryCode);

	const popoverPlacement = useMemo(() => {
		if (!popover) return "bottom-start";

		const screenHeight = window.innerHeight;
		const anchorY = rect.y;
		const spaceBelow =
			screenHeight - anchorY - rect.height - FOOTER_HEIGHT - 8;
		const spaceAbove = anchorY - 8;
		const estimatedPopoverHeight = 300;

		if (spaceBelow < estimatedPopoverHeight && spaceAbove > spaceBelow) {
			return "top-start";
		}

		return "bottom-start";
	}, [rect.x, rect.y, rect.width, rect.height, popover]);

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

		const placements: string[] = [];

		if (spaceAbove > spaceBelow) {
			placements.push("top-start", "top-end");
			placements.push("bottom-start", "bottom-end");
		} else {
			placements.push("bottom-start", "bottom-end");
			placements.push("top-start", "top-end");
		}

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
			className="flex flex-col justify-center items-stretch h-full box-border overflow-visible"
			style={editorStyle}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			tabIndex={-1}
			data-editor-container
		>
			<div className="flex items-center gap-2 flex-1 min-h-0 overflow-hidden">
				<div
					ref={countryInputRef}
					className="flex items-start gap-1.5 cursor-pointer p-1 px-2 rounded transition-colors flex-shrink-0 hover:bg-gray-100"
					onClick={() => {
						setPopover((prev) => !prev);
					}}
					data-testid="phone-number-editor-country-input"
				>
					{country && (
						<img
							className="w-5 h-[15px] object-cover rounded-sm flex-shrink-0"
							src={getFlagUrl(country.countryCode)}
							alt={country.countryName}
							loading="lazy"
						/>
					)}

					{currentValue.countryNumber && (
						<span className="text-sm text-[#333] font-medium whitespace-nowrap">
							+{currentValue.countryNumber}
						</span>
					)}

					<Icon
						className="w-[15px] h-[15px] text-black flex-shrink-0"
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

				<div className="w-px h-6 bg-[#e0e0e0] flex-shrink-0" />

				<input
					ref={phoneNumberInputRef}
					type="text"
					placeholder={pattern || "299"}
					value={currentValue.phoneNumber || ""}
					onChange={handlePhoneNumberChange}
					onFocus={handleInputFocus}
					className="flex-1 border-none outline-none text-sm text-[#333] bg-transparent p-0 min-w-0 placeholder:text-[#999]"
					name="phoneNumber"
				/>
			</div>

			{popover && (
				<div
					className="absolute top-full left-0 mt-2 z-[1001] bg-white rounded shadow-lg overflow-hidden min-w-[250px] max-w-[400px]"
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
			)}
		</div>
	);
};
