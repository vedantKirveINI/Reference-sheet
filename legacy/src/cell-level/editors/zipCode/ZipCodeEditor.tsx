import React, { useRef, useCallback, useMemo, useEffect } from "react";
import Icon from "oute-ds-icon";
import ODSPopper from "oute-ds-popper";
import type { IZipCodeCell } from "@/types";
import { FOOTER_HEIGHT } from "@/config/grid";
import { CountryList } from "../phoneNumber/components/CountryList";
import {
	getCountry,
	getFlagUrl,
} from "../../renderers/phoneNumber/utils/countries";
import { useZipCodeEditor } from "./hooks/useZipCodeEditor";
import styles from "./ZipCodeEditor.module.css";

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
			className={styles.zip_code_container}
			style={editorStyle}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			tabIndex={-1}
			data-testid="zip-code-editor"
		>
			<div className={styles.zip_code_input_container}>
				<div
					ref={countryInputRef}
					className={styles.country_input}
					onClick={() => setPopover((prev) => !prev)}
				>
					{country && (
						<img
							className={styles.country_flag}
							src={getFlagUrl(country.countryCode)}
							alt={country.countryName}
							loading="lazy"
						/>
					)}
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

				<div className={styles.vertical_line} />

				<input
					ref={zipCodeInputRef}
					className={styles.zip_code_input}
					type="text"
					value={currentValue.zipCode}
					placeholder={patternPlaceholder}
					onChange={handleZipCodeChange}
					onFocus={handleInputFocus}
					name="zipCode"
				/>
			</div>

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
							padding: 8,
							fallbackPlacements: ["top-start", "bottom-start"],
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
			</ODSPopper>
		</div>
	);
};
