import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import styles from "./OptionList.module.css";

interface OptionListProps {
        options: string[];
        selectedOption: string | null;
        onSelectOption: (option: string) => void;
}

export const OptionList: React.FC<OptionListProps> = ({
        options,
        selectedOption,
        onSelectOption,
}) => {
        const [searchValue, setSearchValue] = useState("");
        const radioGroupName = useId();
        const searchFieldRef = useRef<HTMLInputElement>(null);
        const optionContainerRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
                searchFieldRef.current?.focus();
        }, []);

        const filteredOptions = useMemo(() => {
                return options.filter((option) =>
                        option.toLowerCase().includes(searchValue.toLowerCase()),
                );
        }, [options, searchValue]);

        const handleClearSearch = () => {
                setSearchValue("");
                searchFieldRef.current?.focus();
        };

        const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
                setSearchValue(event.target.value);
        };

        // Handle mouse wheel scrolling in option list (same pattern as MCQ OptionList)
        useEffect(() => {
                const optionContainer = optionContainerRef.current;
                if (!optionContainer) return;

                const handleWheel = (e: WheelEvent) => {
                        e.stopPropagation();
                        const { scrollTop, scrollHeight, clientHeight } = optionContainer;
                        const isScrollable = scrollHeight > clientHeight;
                        if (!isScrollable) {
                                e.preventDefault();
                                return;
                        }
                        const isAtTop = scrollTop === 0;
                        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;
                        if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                                e.preventDefault();
                        }
                };

                optionContainer.addEventListener("wheel", handleWheel, {
                        passive: false,
                });

                return () => {
                        optionContainer.removeEventListener("wheel", handleWheel);
                };
        }, []);

        return (
                <div
                        className={styles.option_list_container}
                        data-scq-option-list
                        onClick={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                >
                        <div className={styles.search_container}>
                                <div className="relative w-full">
                                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-5 w-5 text-[#90a4ae]" />
                                        <Input
                                                ref={searchFieldRef}
                                                placeholder="Find your option"
                                                value={searchValue}
                                                autoFocus
                                                onChange={handleSearchChange}
                                                className="w-full pl-8 pr-8 rounded-md"
                                        />
                                        {searchValue && (
                                                <button
                                                        onClick={handleClearSearch}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-0 border-0 bg-transparent cursor-pointer"
                                                >
                                                        <X className="h-[1.1rem] w-[1.1rem]" />
                                                </button>
                                        )}
                                </div>
                        </div>

                        <div ref={optionContainerRef} className={styles.option_container}>
                                {filteredOptions.length === 0 ? (
                                        <div className={styles.option_not_found}>
                                                No options found
                                        </div>
                                ) : (
                                        filteredOptions.map((option) => (
                                                <label
                                                        key={option}
                                                        className={styles.radio_option_wrapper}
                                                >
                                                        <input
                                                                type="radio"
                                                                name={radioGroupName}
                                                                checked={selectedOption === option}
                                                                onChange={() => onSelectOption(option)}
                                                                value={option}
                                                        />
                                                        <span>{option}</span>
                                                </label>
                                        ))
                                )}
                        </div>
                </div>
        );
};
