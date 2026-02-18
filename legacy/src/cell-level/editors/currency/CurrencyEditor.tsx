import { useCallback, useMemo, useRef, useEffect } from "react";
import { Icon } from "@/lib/oute-icon";
import type { ICurrencyCell } from "@/types";
import { FOOTER_HEIGHT } from "@/config/grid";
import { CountryList } from "../phoneNumber/components/CountryList";
import {
	getCountry,
	getFlagUrl,
} from "../../renderers/phoneNumber/utils/countries";
import { useCurrencyEditor } from "./hooks/useCurrencyEditor";

interface CurrencyEditorProps {
	cell: ICurrencyCell;
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

export const CurrencyEditor: React.FC<CurrencyEditorProps> = ({
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
	const countryInputRef = useRef<HTMLDivElement>(null);

	const {
		currentValue,
		search,
		popover,
		iconName,
		filteredCountries,
		currencyInputRef,
		searchFieldRef,
		selectedCountryRef,
		setPopover,
		setSearch,
		handleCurrencyValueChange,
		handleCountryClick,
		handleInputFocus,
	} = useCurrencyEditor({
		initialValue: cell?.data || null,
	});

	const commitValue = useCallback(() => {
		if (
			currentValue.currencyValue ||
			currentValue.currencyCode ||
			currentValue.currencySymbol
		) {
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
		[commitValue, onCancel, onEnterKey, popover],
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

	const country = currentValue.countryCode
		? getCountry(currentValue.countryCode)
		: undefined;

	useEffect(() => {
		if (!isEditing) {
			setPopover(false);
		}
	}, [isEditing, setPopover]);

	return (
		<div
			ref={containerRef}
			className="flex flex-col justify-center items-stretch h-full box-border overflow-visible"
			style={editorStyle}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			onMouseDown={handleMouseDown}
			tabIndex={-1}
			data-testid="currency-editor"
		>
			<div className="flex items-center gap-2 flex-1 min-h-0 overflow-hidden w-full">
				<div
					ref={countryInputRef}
					className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded transition-colors hover:bg-[#f5f5f5] shrink-0"
					onClick={() => setPopover((prev) => !prev)}
				>
					{country && (
						<img
							className="w-5 h-[15px] object-cover rounded-sm shrink-0"
							src={getFlagUrl(country.countryCode)}
							alt={country.countryName}
							loading="lazy"
						/>
					)}
					{currentValue.currencyCode && (
						<span className="text-sm text-[var(--cell-text-primary-color,#212121)] font-medium whitespace-nowrap">
							{currentValue.currencyCode}
						</span>
					)}
					{currentValue.currencySymbol && (
						<span className="text-sm text-[#607d8b] whitespace-nowrap">
							{currentValue.currencySymbol}
						</span>
					)}
					<Icon
						outeIconName={iconName}
						outeIconProps={{
							className: "w-[0.9375rem] h-[0.9375rem] text-black shrink-0",
						}}
					/>
				</div>

				<div className="w-px h-6 bg-[#e0e0e0] shrink-0" />

				<input
					ref={currencyInputRef}
					className="flex-1 border-none outline-none text-sm text-[#333] bg-transparent p-0 min-w-0 placeholder:text-[#9e9e9e]"
					type="text"
					name="currencyValue"
					placeholder="299"
					value={currentValue.currencyValue}
					onChange={handleCurrencyValueChange}
					onFocus={handleInputFocus}
				/>
			</div>

			{popover && (
				<div
					className="bg-white rounded border border-[#e0e0e0] shadow-md overflow-hidden z-[1001] min-w-[250px] max-w-[400px]"
					onMouseDown={(event) => event.stopPropagation()}
					style={{
						position: "absolute",
						top: popoverPlacement === "top-start" ? "auto" : "100%",
						bottom: popoverPlacement === "top-start" ? "100%" : "auto",
						left: 0,
						marginTop: popoverPlacement === "top-start" ? undefined : "8px",
						marginBottom: popoverPlacement === "top-start" ? "8px" : undefined,
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
						showCountryNumber={false}
						showCurrencyCode
						showCurrencySymbol
						searchPlaceholder="Search by country or currency"
					/>
				</div>
			)}
		</div>
	);
};
