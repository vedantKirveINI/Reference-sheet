import { useCallback, useMemo, useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { ICurrencyCell } from "@/types";
import { FOOTER_HEIGHT } from "@/config/grid";
import { CountryList } from "../phoneNumber/components/CountryList";
import {
        getCountry,
        getFlagUrl,
} from "../../renderers/phoneNumber/utils/countries";
import { useCurrencyEditor } from "./hooks/useCurrencyEditor";
import styles from "./CurrencyEditor.module.css";

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

        // Get country info for display
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
                        className={styles.currency_container}
                        style={editorStyle}
                        onKeyDown={handleKeyDown}
                        onBlur={handleBlur}
                        onMouseDown={handleMouseDown}
                        tabIndex={-1}
                        data-testid="currency-editor"
                >
                        <div className={styles.currency_input_container}>
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
                                        {popover ? (
                                                <ChevronUp className="h-[0.9375rem] w-[0.9375rem] text-black" />
                                        ) : (
                                                <ChevronDown className="h-[0.9375rem] w-[0.9375rem] text-black" />
                                        )}
                                </div>

                                <div className={styles.vertical_line} />

                                <input
                                        ref={currencyInputRef}
                                        className={styles.currency_value_input}
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
                                        className={styles.popover_container}
                                        onMouseDown={(event) => event.stopPropagation()}
                                        style={{
                                                position: "absolute",
                                                ...(popoverPlacement.startsWith("top")
                                                        ? { bottom: "100%", marginBottom: "8px" }
                                                        : { top: "100%", marginTop: "8px" }),
                                                left: 0,
                                                zIndex: 1001,
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
