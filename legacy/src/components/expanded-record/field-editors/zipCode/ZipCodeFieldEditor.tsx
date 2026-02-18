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
import ODSIcon from "@/lib/oute-icon";
import { CountryList } from "@/cell-level/editors/phoneNumber/components/CountryList";
import { getZipCodePattern } from "@/cell-level/renderers/zipCode/utils/zipCodePatterns";
import {
	getFlagUrl,
	getAllCountryCodes,
	COUNTRIES,
} from "@/cell-level/renderers/phoneNumber/utils/countries";

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

	const currentValue = useMemo(() => {
		if (!value) return { countryCode: "", zipCode: "" };
		if (typeof value === "string") {
			try {
				const parsed = JSON.parse(value);
				return { countryCode: parsed?.countryCode || "", zipCode: parsed?.zipCode || "" };
			} catch {
				return { countryCode: "", zipCode: "" };
			}
		}
		if (typeof value === "object" && value !== null) {
			return { countryCode: (value as any).countryCode || "", zipCode: (value as any).zipCode || "" };
		}
		return zipCodeCell?.data || { countryCode: "", zipCode: "" };
	}, [value, zipCodeCell]);

	const patternConfig = useMemo(
		() => getZipCodePattern(currentValue.countryCode),
		[currentValue.countryCode],
	);

	const patternPlaceholder = useMemo(() => {
		if (!patternConfig.pattern) return "Zip code";
		return patternConfig.pattern.replace(/9/g, "0").replace(/A/g, "A").replace(/-/g, "-").replace(/\s+/g, " ");
	}, [patternConfig.pattern]);

	const filteredCountries = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return getAllCountryCodes();

		return getAllCountryCodes().filter((code: string) => {
			const country = COUNTRIES[code];
			if (!country) return false;
			return (
				country.countryName.toLowerCase().includes(query) ||
				country.countryCode.toLowerCase().includes(query)
			);
		});
	}, [search]);

	const sanitizeZipCode = (val: string) => {
		return val.replace(/[^A-Za-z0-9\s-]/g, "").toUpperCase();
	};

	const handleZipCodeChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			if (readonly) return;
			const formatted = sanitizeZipCode(e.target.value);
			const newValue = { ...currentValue, zipCode: formatted };
			onChange(newValue);
		},
		[currentValue, onChange, readonly],
	);

	const handleCountryClick = useCallback(
		(countryCode: string) => {
			if (readonly) return;
			const newValue = { ...currentValue, countryCode };
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
				!target.closest("[data-country-list]")
			) {
				handleCloseCountryDropdown();
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [popoverOpen, handleCloseCountryDropdown]);

	useEffect(() => {
		if (popoverOpen && searchFieldRef.current) {
			requestAnimationFrame(() => {
				searchFieldRef.current?.focus();
			});
		}
	}, [popoverOpen]);

	const flagUrl = currentValue.countryCode ? getFlagUrl(currentValue.countryCode) : null;
	const iconName = popoverOpen ? "OUTEExpandLessIcon" : "OUTEExpandMoreIcon";

	return (
		<div ref={containerRef} className="w-full relative min-h-[36px]">
			<div className="flex items-center gap-2 w-full min-h-[36px] py-1 px-2 border border-[#e0e0e0] rounded bg-white focus-within:border-[rgb(33,150,243)]">
				<div
					ref={countryInputRef}
					className="flex items-center gap-1.5 cursor-pointer p-1 rounded-md flex-shrink-0"
					onClick={handleOpenCountryDropdown}
					data-testid="zipcode-country-selector"
				>
					{flagUrl && (
						<img
							className="w-5 h-[15px] object-cover rounded-sm flex-shrink-0"
							src={flagUrl}
							alt={currentValue.countryCode}
							loading="lazy"
						/>
					)}
					<ODSIcon
						outeIconName={iconName}
						outeIconProps={{ size: 24, className: "w-6 h-6 text-black" }}
					/>
				</div>

				<div className="w-px h-6 bg-[#e0e0e0] flex-shrink-0" />

				<input
					ref={zipCodeInputRef}
					type="text"
					className="border-none outline-none text-base font-[Inter] text-[#212121] p-0 min-w-0 w-full placeholder:text-[#9e9e9e] read-only:cursor-not-allowed"
					value={currentValue.zipCode}
					placeholder={patternPlaceholder}
					onChange={handleZipCodeChange}
					readOnly={readonly}
					name="zipCode"
				/>
			</div>

			{popoverOpen && (
				<div className="absolute z-[100] bg-white border border-[#e0e0e0] rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] min-w-[13.75rem] max-w-[22.5rem] max-h-[18.75rem] overflow-hidden">
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
				</div>
			)}
		</div>
	);
};
