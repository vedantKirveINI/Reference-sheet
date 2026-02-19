/**
 * CountryList component - displays searchable list of countries in a popover
 * Inspired by sheets project's country selector
 */
import React, { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { CountryItem } from "./CountryItem";
import styles from "./CountryList.module.css";

interface CountryListProps {
        filteredCountries: string[];
        selectedCountryCode: string;
        search: string;
        searchFieldRef: React.RefObject<HTMLInputElement>;
        onCountryClick: (countryCode: string) => void;
        selectedCountryRef: React.RefObject<HTMLDivElement>;
        onSearchChange: (value: string) => void;
        showCountryNumber?: boolean;
        showCurrencyCode?: boolean;
        showCurrencySymbol?: boolean;
        searchPlaceholder?: string;
}

export const CountryList: React.FC<CountryListProps> = ({
        filteredCountries,
        selectedCountryCode,
        search,
        searchFieldRef,
        onCountryClick,
        selectedCountryRef,
        onSearchChange,
        showCountryNumber = true,
        showCurrencyCode = false,
        showCurrencySymbol = false,
        searchPlaceholder = "Search Country",
}) => {
        const countryContainerRef = useRef<HTMLDivElement>(null);

        // Auto-focus search field when component mounts
        useEffect(() => {
                if (searchFieldRef.current) {
                        searchFieldRef.current.focus();
                }
        }, [searchFieldRef]);

        // Handle mouse wheel scrolling in country list
        useEffect(() => {
                const countryContainer = countryContainerRef.current;
                if (!countryContainer) return;

                const handleWheel = (e: WheelEvent) => {
                        // Stop propagation to prevent canvas scrolling
                        e.stopPropagation();

                        // Allow native scrolling within the container
                        const { scrollTop, scrollHeight, clientHeight } = countryContainer;
                        const isAtTop = scrollTop === 0;
                        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

                        // Prevent default only if we're at the boundary and scrolling in that direction
                        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                                e.preventDefault();
                        }
                };

                countryContainer.addEventListener("wheel", handleWheel, {
                        passive: false,
                });

                return () => {
                        countryContainer.removeEventListener("wheel", handleWheel);
                };
        }, []);

        return (
                <div className={styles.country_list_container}>
                        {/* Search field */}
                        <div className={styles.search_container}>
                                <div className="relative w-full">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[#637381]" />
                                        <Input
                                                ref={searchFieldRef}
                                                placeholder={searchPlaceholder}
                                                value={search}
                                                onChange={(event) => onSearchChange(event.target.value)}
                                                className="w-full pl-8 pr-8"
                                        />
                                        {search && (
                                                <button
                                                        onClick={() => {
                                                                onSearchChange("");
                                                                searchFieldRef.current?.focus();
                                                        }}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0 border-0 bg-transparent cursor-pointer"
                                                >
                                                        <X className="h-4 w-4 text-[#637381]" />
                                                </button>
                                        )}
                                </div>
                        </div>

                        {/* Countries list */}
                        <div
                                ref={countryContainerRef}
                                className={styles.countries_container}
                        >
                                {filteredCountries.length === 0 ? (
                                        <div className={styles.no_options}>No options found</div>
                                ) : (
                                        filteredCountries.map((codeOfCountry) => {
                                                const isCountrySelected =
                                                        codeOfCountry === selectedCountryCode;
                                                const countryRef = isCountrySelected
                                                        ? selectedCountryRef
                                                        : null;

                                                return (
                                                        <CountryItem
                                                                key={codeOfCountry}
                                                                ref={countryRef}
                                                                codeOfCountry={codeOfCountry}
                                                                onClick={onCountryClick}
                                                                showCountryNumber={showCountryNumber}
                                                                showCurrencyCode={showCurrencyCode}
                                                                showCurrencySymbol={showCurrencySymbol}
                                                                isCountrySelected={isCountrySelected}
                                                        />
                                                );
                                        })
                                )}
                        </div>
                </div>
        );
};
