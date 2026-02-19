import React, {
	useState,
	useCallback,
	useRef,
	useEffect,
	useMemo,
	FC,
} from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { ICurrencyCell } from "@/types";
import ODSPopper from "oute-ds-popper";
import ODSIcon from "oute-ds-icon";
import { CountryList } from "@/cell-level/editors/phoneNumber/components/CountryList";
import {
	getFlagUrl,
	getAllCountryCodes,
	getCountry,
	COUNTRIES,
} from "@/cell-level/renderers/phoneNumber/utils/countries";
import styles from "./CurrencyFieldEditor.module.scss";

export const CurrencyFieldEditor: FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const countryInputRef = useRef<HTMLDivElement>(null);
	const currencyInputRef = useRef<HTMLInputElement>(null);
	const searchFieldRef = useRef<HTMLInputElement>(null);
	const selectedCountryRef = useRef<HTMLDivElement>(null);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [search, setSearch] = useState("");

	const currencyCell = cell as ICurrencyCell | undefined;

	// Parse value
	const currentValue = useMemo(() => {
		if (!value) {
			return {
				countryCode: "",
				currencyCode: "",
				currencySymbol: "",
				currencyValue: "",
			};
		}
		if (typeof value === "string") {
			try {
				const parsed = JSON.parse(value);
				return {
					countryCode: parsed?.countryCode || "",
					currencyCode: parsed?.currencyCode || "",
					currencySymbol: parsed?.currencySymbol || "",
					currencyValue: parsed?.currencyValue || "",
				};
			} catch {
				return {
					countryCode: "",
					currencyCode: "",
					currencySymbol: "",
					currencyValue: "",
				};
			}
		}
		if (typeof value === "object" && value !== null) {
			return {
				countryCode: (value as any).countryCode || "",
				currencyCode: (value as any).currencyCode || "",
				currencySymbol: (value as any).currencySymbol || "",
				currencyValue: (value as any).currencyValue || "",
			};
		}
		return (
			currencyCell?.data || {
				countryCode: "",
				currencyCode: "",
				currencySymbol: "",
				currencyValue: "",
			}
		);
	}, [value, currencyCell]);

	// Filter countries based on search
	const filteredCountries = useMemo(() => {
		const query = search.trim().toLowerCase();
		const allCodes = getAllCountryCodes();
		if (!query) {
			return allCodes;
		}

		return allCodes.filter((code: string) => {
			const country = COUNTRIES[code];
			if (!country) return false;
			const currencyCode = country.currencyCode?.toLowerCase() ?? "";
			const currencySymbol = country.currencySymbol?.toLowerCase() ?? "";
			return (
				country.countryName.toLowerCase().includes(query) ||
				country.countryCode.toLowerCase().includes(query) ||
				currencyCode.includes(query) ||
				currencySymbol.includes(query)
			);
		});
	}, [search]);

	// Get country info for display
	const country = currentValue.countryCode
		? getCountry(currentValue.countryCode)
		: undefined;

	// Sanitize currency value input (only numbers and decimal point)
	const sanitizeCurrencyValue = (val: string) => {
		return val.replace(/[^\d.]/g, "");
	};

	// Handle currency value change
	const handleCurrencyValueChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (readonly) return;
			const sanitized = sanitizeCurrencyValue(e.target.value);
			const newValue = {
				...currentValue,
				currencyValue: sanitized,
			};
			onChange(newValue);
		},
		[currentValue, onChange, readonly],
	);

	// Handle country selection
	const handleCountryClick = useCallback(
		(countryCode: string) => {
			if (readonly) return;
			const country = getCountry(countryCode);
			if (!country) return;

			const newValue = {
				...currentValue,
				countryCode: country.countryCode,
				currencyCode: country.currencyCode || currentValue.currencyCode,
				currencySymbol:
					country.currencySymbol || currentValue.currencySymbol,
			};
			onChange(newValue);
			setPopoverOpen(false);
			setSearch("");
		},
		[currentValue, onChange, readonly],
	);

	// Handle opening country dropdown
	const handleOpenCountryDropdown = useCallback(
		(e: React.MouseEvent) => {
			if (readonly) return;
			e.stopPropagation();
			setPopoverOpen(true);
			setSearch("");
		},
		[readonly],
	);

	// Handle closing country dropdown
	const handleCloseCountryDropdown = useCallback(() => {
		setPopoverOpen(false);
		setSearch("");
	}, []);

	// Close dropdown when clicking outside
	useEffect(() => {
		if (!popoverOpen) return;

		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as HTMLElement;
			if (
				containerRef.current &&
				!containerRef.current.contains(target) &&
				!target.closest("[data-currency-country-list]")
			) {
				handleCloseCountryDropdown();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [popoverOpen, handleCloseCountryDropdown]);

	// Auto-focus search when popover opens
	useEffect(() => {
		if (popoverOpen && searchFieldRef.current) {
			requestAnimationFrame(() => {
				searchFieldRef.current?.focus();
			});
		}
	}, [popoverOpen]);

	const flagUrl = currentValue.countryCode
		? getFlagUrl(currentValue.countryCode)
		: null;
	const iconName = popoverOpen ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon";

	return (
		<div ref={containerRef} className={styles.currency_editor}>
			<div className={styles.currency_input_container}>
				{/* Country Selector */}
				<div
					ref={countryInputRef}
					className={styles.country_flag_container}
					onClick={handleOpenCountryDropdown}
					data-testid="currency-country-selector"
				>
					{flagUrl && (
						<img
							className={styles.country_flag}
							src={flagUrl}
							alt={currentValue.countryCode}
							loading="lazy"
						/>
					)}
					{currentValue.currencyCode && (
						<span className={styles.currency_code}>
							{currentValue.currencyCode}
						</span>
					)}
					{currentValue.currencySymbol && (
						<span className={styles.currency_symbol}>
							{currentValue.currencySymbol}
						</span>
					)}
					<ODSIcon
						outeIconName={iconName}
						outeIconProps={{
							sx: {
								width: "1.5rem",
								height: "1.5rem",
								color: "#000",
							},
						}}
					/>
				</div>

				{/* Vertical Separator */}
				<div className={styles.vertical_line} />

				{/* Currency Value Input */}
				<input
					ref={currencyInputRef}
					type="text"
					className={styles.currency_value_input}
					value={currentValue.currencyValue}
					placeholder="299"
					onChange={handleCurrencyValueChange}
					readOnly={readonly}
					name="currencyValue"
				/>
			</div>

			{/* Country List - Using ODSPopper */}
			<ODSPopper
				open={popoverOpen}
				anchorEl={countryInputRef.current}
				placement="bottom-start"
				disablePortal
				className={styles.popper_container}
			>
				<div data-currency-country-list>
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
			</ODSPopper>
		</div>
	);
};
