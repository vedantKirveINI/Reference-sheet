import React, {
	useState,
	useCallback,
	useRef,
	useEffect,
	useMemo,
	FC,
} from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IZipCodeCell } from "@/types";
import ODSPopper from "oute-ds-popper";
import ODSIcon from "oute-ds-icon";
import { CountryList } from "@/cell-level/editors/phoneNumber/components/CountryList";
import { getZipCodePattern } from "@/cell-level/renderers/zipCode/utils/zipCodePatterns";
import {
	getFlagUrl,
	getAllCountryCodes,
	COUNTRIES,
} from "@/cell-level/renderers/phoneNumber/utils/countries";
import styles from "./ZipCodeFieldEditor.module.scss";

export const ZipCodeFieldEditor: FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const countryInputRef = useRef<HTMLDivElement>(null);
	const zipCodeInputRef = useRef<HTMLInputElement>(null);
	const searchFieldRef = useRef<HTMLInputElement>(null);
	const selectedCountryRef = useRef<HTMLDivElement>(null);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [search, setSearch] = useState("");

	const zipCodeCell = cell as IZipCodeCell | undefined;

	// Parse value
	const currentValue = useMemo(() => {
		if (!value) {
			return { countryCode: "", zipCode: "" };
		}
		if (typeof value === "string") {
			try {
				const parsed = JSON.parse(value);
				return {
					countryCode: parsed?.countryCode || "",
					zipCode: parsed?.zipCode || "",
				};
			} catch {
				return { countryCode: "", zipCode: "" };
			}
		}
		if (typeof value === "object" && value !== null) {
			return {
				countryCode: (value as any).countryCode || "",
				zipCode: (value as any).zipCode || "",
			};
		}
		return zipCodeCell?.data || { countryCode: "", zipCode: "" };
	}, [value, zipCodeCell]);

	// Get zip code pattern for current country
	const patternConfig = useMemo(
		() => getZipCodePattern(currentValue.countryCode),
		[currentValue.countryCode],
	);

	const patternPlaceholder = useMemo(() => {
		if (!patternConfig.pattern) {
			return "Zip code";
		}
		return patternConfig.pattern
			.replace(/9/g, "0")
			.replace(/A/g, "A")
			.replace(/-/g, "-")
			.replace(/\s+/g, " ");
	}, [patternConfig.pattern]);

	// Filter countries based on search
	const filteredCountries = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) {
			return getAllCountryCodes();
		}

		return getAllCountryCodes().filter((code: string) => {
			const country = COUNTRIES[code];
			if (!country) return false;

			return (
				country.countryName.toLowerCase().includes(query) ||
				country.countryCode.toLowerCase().includes(query)
			);
		});
	}, [search]);

	// Sanitize zip code input
	const sanitizeZipCode = (val: string) => {
		return val.replace(/[^A-Za-z0-9\s-]/g, "").toUpperCase();
	};

	// Handle zip code change
	const handleZipCodeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (readonly) return;
			const formatted = sanitizeZipCode(e.target.value);
			const newValue = {
				...currentValue,
				zipCode: formatted,
			};
			onChange(newValue);
		},
		[currentValue, onChange, readonly],
	);

	// Handle country selection
	const handleCountryClick = useCallback(
		(countryCode: string) => {
			if (readonly) return;
			const newValue = {
				...currentValue,
				countryCode,
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
				!target.closest("[data-country-list]")
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
		<div ref={containerRef} className={styles.zipcode_editor}>
			<div className={styles.zipcode_input_container}>
				{/* Country Selector */}
				<div
					ref={countryInputRef}
					className={styles.country_flag_container}
					onClick={handleOpenCountryDropdown}
					data-testid="zipcode-country-selector"
				>
					{flagUrl && (
						<img
							className={styles.country_flag}
							src={flagUrl}
							alt={currentValue.countryCode}
							loading="lazy"
						/>
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

				{/* Zip Code Input */}
				<input
					ref={zipCodeInputRef}
					type="text"
					className={styles.zip_code_input}
					value={currentValue.zipCode}
					placeholder={patternPlaceholder}
					onChange={handleZipCodeChange}
					readOnly={readonly}
					name="zipCode"
				/>
			</div>

			{/* Country List - Using ODSPopper (like cell-level editors) */}
			<ODSPopper
				open={popoverOpen}
				anchorEl={countryInputRef.current}
				placement="bottom-start"
				disablePortal
				className={styles.popper_container}
			>
				<div data-country-list>
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
