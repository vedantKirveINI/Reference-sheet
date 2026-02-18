import React, { useRef, useCallback, useMemo, useEffect } from "react";
import { Icon } from "@/lib/oute-icon";
import type { IZipCodeCell } from "@/types";
import { FOOTER_HEIGHT } from "@/config/grid";
import { CountryList } from "../phoneNumber/components/CountryList";
import {
	getCountry,
	getFlagUrl,
} from "../../renderers/phoneNumber/utils/countries";
import { useZipCodeEditor } from "./hooks/useZipCodeEditor";

interface ZipCodeEditorProps {
	cell: IZipCodeCell;
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

export const ZipCodeEditor: React.FC<ZipCodeEditorProps> = ({
	cell,
	rect,
	theme,
	isEditing,
	onChange,
	onSave,
	onCancel,
	onEnterKey,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const initialValue = cell?.data || null;

	const {
		currentValue,
		popover,
		search,
		patternPlaceholder,
		zipCodeInputRef,
		countryInputRef,
		selectedCountryRef,
		searchFieldRef,
		filteredCountries,
		setSearch,
		setPopover,
		handleZipCodeChange,
		handleCountryClick,
		handleInputFocus,
	} = useZipCodeEditor({
		initialValue,
	});

	const commitValue = useCallback(() => {
		if (currentValue.zipCode) {
			onChange(currentValue);
		} else {
			onChange(null);
		}
		onSave?.();
	}, [currentValue, onChange, onSave]);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent) => {
			if (event.key === "Enter" && !popover) {
				event.preventDefault();
				event.stopPropagation();
				commitValue();
				if (onEnterKey) {
					requestAnimationFrame(() => {
						onEnterKey(event.shiftKey);
					});
				}
			} else if (event.key === "Tab") {
				event.preventDefault();
				event.stopPropagation();
				commitValue();
			} else if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				onCancel?.();
			}
		},
		[commitValue, onEnterKey, onCancel, popover],
	);

	const handleBlur = useCallback(() => {
		setTimeout(() => {
			const activeElement = document.activeElement;
			if (
				containerRef.current &&
				(activeElement === containerRef.current ||
					containerRef.current.contains(activeElement))
			) {
				return;
			}
			commitValue();
		}, 0);
	}, [commitValue]);

	const handleMouseDown = useCallback((event: React.MouseEvent) => {
		event.stopPropagation();
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

	const country = currentValue.countryCode
		? getCountry(currentValue.countryCode)
		: undefined;

	const popoverPlacement = useMemo(() => {
		if (!popover) {
			return "bottom-start";
		}

		const screenHeight = window.innerHeight;
		const anchorY = rect.y;
		const spaceBelow =
			screenHeight - anchorY - rect.height - FOOTER_HEIGHT - 8;
		const spaceAbove = anchorY - 8;

		if (spaceBelow < 260 && spaceAbove > spaceBelow) {
			return "top-start";
		}

		return "bottom-start";
	}, [popover, rect.y, rect.height]);

	useEffect(() => {
		if (!isEditing) {
			setPopover(false);
		}
	}, [isEditing, setPopover]);

	return (
		<div
			ref={containerRef}
			className="flex flex-col h-full box-border"
			style={editorStyle}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			tabIndex={-1}
			data-testid="zip-code-editor"
		>
			<div className="flex items-center gap-2 flex-1 min-h-0 overflow-hidden">
				<div
					ref={countryInputRef}
					className="flex items-center gap-1.5 cursor-pointer p-1 px-2 rounded transition-colors flex-shrink-0 hover:bg-gray-100"
					onClick={() => setPopover((prev) => !prev)}
				>
					{country && (
						<img
							className="w-5 h-[15px] object-cover rounded-sm flex-shrink-0"
							src={getFlagUrl(country.countryCode)}
							alt={country.countryName}
							loading="lazy"
						/>
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
					ref={zipCodeInputRef}
					className="flex-1 border-none outline-none text-sm text-[#333] bg-transparent p-0 min-w-0 uppercase placeholder:text-[#9e9e9e]"
					type="text"
					value={currentValue.zipCode}
					placeholder={patternPlaceholder}
					onChange={handleZipCodeChange}
					onFocus={handleInputFocus}
					name="zipCode"
				/>
			</div>

			{popover && (
				<div
					className="absolute top-full left-0 mt-2 z-[1001] bg-white rounded shadow-lg overflow-hidden min-w-[220px] max-w-[360px]"
					onMouseDown={(event) => event.stopPropagation()}
				>
					<CountryList
						filteredCountries={filteredCountries}
						selectedCountryCode={currentValue.countryCode}
						search={search}
						searchFieldRef={searchFieldRef}
						onCountryClick={handleCountryClick}
						selectedCountryRef={selectedCountryRef}
						onSearchChange={setSearch}
						showCountryNumber={false}
					/>
				</div>
			)}
		</div>
	);
};
