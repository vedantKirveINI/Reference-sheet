import React, {
	useState,
	useCallback,
	useRef,
	useEffect,
	useMemo,
	FC,
} from "react";
import type { IFieldEditorProps } from "../../utils/getFieldEditor";
import type { IPhoneNumberCell } from "@/types";
import ODSPopper from "oute-ds-popper";
import ODSIcon from "oute-ds-icon";
import { CountryList } from "@/cell-level/editors/phoneNumber/components/CountryList";
import {
	getFlagUrl,
	getAllCountryCodes,
	getCountry,
	COUNTRIES,
} from "@/cell-level/renderers/phoneNumber/utils/countries";
import styles from "./PhoneNumberFieldEditor.module.scss";

export const PhoneNumberFieldEditor: FC<IFieldEditorProps> = ({
	field,
	cell,
	value,
	onChange,
	readonly = false,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const countryInputRef = useRef<HTMLDivElement>(null);
	const phoneNumberInputRef = useRef<HTMLInputElement>(null);
	const searchFieldRef = useRef<HTMLInputElement>(null);
	const selectedCountryRef = useRef<HTMLDivElement>(null);
	const [popoverOpen, setPopoverOpen] = useState(false);
	const [search, setSearch] = useState("");

	const phoneNumberCell = cell as IPhoneNumberCell | undefined;

	// Parse value
	const currentValue = useMemo(() => {
		if (!value) {
			return {
				countryCode: "",
				countryNumber: "",
				phoneNumber: "",
			};
		}
		if (typeof value === "string") {
			try {
				const parsed = JSON.parse(value);
				return {
					countryCode: parsed?.countryCode || "",
					countryNumber: parsed?.countryNumber || "",
					phoneNumber: parsed?.phoneNumber || "",
				};
			} catch {
				return {
					countryCode: "",
					countryNumber: "",
					phoneNumber: "",
				};
			}
		}
		if (typeof value === "object" && value !== null) {
			return {
				countryCode: (value as any).countryCode || "",
				countryNumber: (value as any).countryNumber || "",
				phoneNumber: (value as any).phoneNumber || "",
			};
		}
		return (
			phoneNumberCell?.data || {
				countryCode: "",
				countryNumber: "",
				phoneNumber: "",
			}
		);
	}, [value, phoneNumberCell]);

	// Get country pattern if available
	const country = currentValue.countryCode
		? getCountry(currentValue.countryCode)
		: undefined;
	const pattern = country?.pattern || "";

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
			return (
				country.countryName.toLowerCase().includes(query) ||
				country.countryNumber.includes(query)
			);
		});
	}, [search]);

	// Handle phone number change
	const handlePhoneNumberChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (readonly) return;
			// Remove non-numeric characters (for unmasked value)
			const unmaskedValue = e.target.value.replace(/\D/g, "");
			const newValue = {
				...currentValue,
				phoneNumber: unmaskedValue,
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
				countryNumber: country.countryNumber,
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
				!target.closest("[data-phone-number-country-list]")
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
		<div ref={containerRef} className={styles.phone_number_editor}>
			<div className={styles.phone_number_input_container}>
				{/* Country Selector */}
				<div
					ref={countryInputRef}
					className={styles.country_flag_container}
					onClick={handleOpenCountryDropdown}
					data-testid="phone-number-country-selector"
				>
					{flagUrl && (
						<img
							className={styles.country_flag}
							src={flagUrl}
							alt={currentValue.countryCode}
							loading="lazy"
						/>
					)}
					{currentValue.countryNumber && (
						<span className={styles.country_number}>
							+{currentValue.countryNumber}
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

				{/* Phone Number Input */}
				<input
					ref={phoneNumberInputRef}
					type="text"
					className={styles.phone_number_input}
					value={currentValue.phoneNumber}
					placeholder={pattern || "299"}
					onChange={handlePhoneNumberChange}
					readOnly={readonly}
					name="phoneNumber"
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
				<div data-phone-number-country-list>
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
