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
import ODSIcon from "@/lib/oute-icon";
import { CountryList } from "@/cell-level/editors/phoneNumber/components/CountryList";
import {
	getFlagUrl,
	getAllCountryCodes,
	getCountry,
	COUNTRIES,
} from "@/cell-level/renderers/phoneNumber/utils/countries";

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

	const currentValue = useMemo(() => {
		if (!value) {
			return { countryCode: "", countryNumber: "", phoneNumber: "" };
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
				return { countryCode: "", countryNumber: "", phoneNumber: "" };
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
			phoneNumberCell?.data || { countryCode: "", countryNumber: "", phoneNumber: "" }
		);
	}, [value, phoneNumberCell]);

	const country = currentValue.countryCode
		? getCountry(currentValue.countryCode)
		: undefined;
	const pattern = country?.pattern || "";

	const filteredCountries = useMemo(() => {
		const query = search.trim().toLowerCase();
		const allCodes = getAllCountryCodes();
		if (!query) return allCodes;

		return allCodes.filter((code: string) => {
			const country = COUNTRIES[code];
			if (!country) return false;
			return (
				country.countryName.toLowerCase().includes(query) ||
				country.countryNumber.includes(query)
			);
		});
	}, [search]);

	const handlePhoneNumberChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (readonly) return;
			const unmaskedValue = e.target.value.replace(/\D/g, "");
			const newValue = { ...currentValue, phoneNumber: unmaskedValue };
			onChange(newValue);
		},
		[currentValue, onChange, readonly],
	);

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

	const handleOpenCountryDropdown = useCallback(
		(e: React.MouseEvent) => {
			if (readonly) return;
			e.stopPropagation();
			setPopoverOpen(true);
			setSearch("");
		},
		[readonly],
	);

	const handleCloseCountryDropdown = useCallback(() => {
		setPopoverOpen(false);
		setSearch("");
	}, []);

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
		<div ref={containerRef} className="w-full relative min-h-[36px] z-[1]">
			<div className="flex items-center gap-2 w-full min-h-[36px] py-1 px-2 border border-[#e0e0e0] rounded bg-white focus-within:border-[rgb(33,150,243)]">
				<div
					ref={countryInputRef}
					className="flex items-center gap-1.5 cursor-pointer p-1 rounded-md flex-shrink-0"
					onClick={handleOpenCountryDropdown}
					data-testid="phone-number-country-selector"
				>
					{flagUrl && (
						<img
							className="w-5 h-[15px] object-cover rounded-sm flex-shrink-0"
							src={flagUrl}
							alt={currentValue.countryCode}
							loading="lazy"
						/>
					)}
					{currentValue.countryNumber && (
						<span className="text-base text-[#212121] font-medium whitespace-nowrap">
							+{currentValue.countryNumber}
						</span>
					)}
					<ODSIcon
						outeIconName={iconName}
						outeIconProps={{ size: 24, className: "w-6 h-6 text-black" }}
					/>
				</div>

				<div className="w-px h-6 bg-[#e0e0e0] flex-shrink-0" />

				<input
					ref={phoneNumberInputRef}
					type="text"
					className="border-none outline-none text-base font-[Inter] text-[#212121] p-0 min-w-0 w-full read-only:cursor-not-allowed"
					value={currentValue.phoneNumber}
					placeholder={pattern || "299"}
					onChange={handlePhoneNumberChange}
					readOnly={readonly}
					name="phoneNumber"
				/>
			</div>

			{popoverOpen && (
				<div className="absolute z-[1001] bg-white border border-[#e0e0e0] rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] min-w-[13.75rem] max-w-[22.5rem] max-h-[18.75rem] overflow-hidden">
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
				</div>
			)}
		</div>
	);
};
