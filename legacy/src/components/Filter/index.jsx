import { ConditionComposer } from "@/lib/condition-composer-stub";
import { isEmpty } from "lodash";
import { Button } from "@/components/ui/button";
import ODSIcon from "@/lib/oute-icon";
import { Loader2 } from "lucide-react";
import React, { useRef, useState, memo, useMemo, useEffect } from "react";

import useFilterData from "./useFilterData";
import getFilterSummary from "./utils/getFilterSumary";
import { useModalControlStore } from "@/stores/modalControlStore";

const Filter = ({
        filter = {},
        fields = [],
        onFilterChange = () => {},
        activeBackgroundColor,
}) => {
        const [popover, setPopover] = useState(false);
        const filterRef = useRef(null);
        const popoverRef = useRef(null);
        const filterModalState = useModalControlStore(
                (state) => state.filterModalState,
        );
        const closeFilterModal = useModalControlStore(
                (state) => state.closeFilterModal,
        );

        const mergedFilter = useMemo(() => {
                if (filterModalState.isOpen && filterModalState.initialFilter) {
                        return filterModalState.initialFilter;
                }
                return filter;
        }, [filter, filterModalState.isOpen, filterModalState.initialFilter]);

        useEffect(() => {
                if (filterModalState.isOpen && !popover) {
                        setPopover(true);
                }
        }, [filterModalState.isOpen, popover]);

        const {
                schema = [],
                onApplyHandler: originalOnApplyHandler = () => {},
                conditionRef,
                filterLoading = false,
                handleClick = () => {},
                getUpdatedFilter = () => {},
        } = useFilterData({
                setPopover,
                fields:
                        filterModalState.fields.length > 0
                                ? filterModalState.fields
                                : fields,
                onFilterChange: async (filter) => {
                        onFilterChange(filter);
                        closeFilterModal();
                },
        });

        const onApplyHandler = originalOnApplyHandler;

        const fieldsHash = useMemo(() => {
                return fields.length > 0
                        ? fields
                                        .map((f) => f.id)
                                        .sort()
                                        .join(",")
                        : "no-fields";
        }, [fields]);

        const originalFilterForActiveState = useMemo(() => {
                return getUpdatedFilter({ filter });
        }, [filter, getUpdatedFilter, fieldsHash]);

        const updatedFilter = useMemo(() => {
                return getUpdatedFilter({ filter: mergedFilter });
        }, [mergedFilter, getUpdatedFilter, fieldsHash]);

        const filterKey = useMemo(() => {
                const filterContent = JSON.stringify(updatedFilter?.childs || []);
                return `${filterContent}-${fieldsHash}`;
        }, [updatedFilter?.childs, fieldsHash]);

        const isActive = !isEmpty(originalFilterForActiveState?.childs);

        useEffect(() => {
                if (!popover) return;
                const handleClickOutside = (e) => {
                        if (
                                popoverRef.current &&
                                !popoverRef.current.contains(e.target) &&
                                filterRef.current &&
                                !filterRef.current.contains(e.target)
                        ) {
                                setPopover(false);
                                closeFilterModal();
                        }
                };
                document.addEventListener("mousedown", handleClickOutside);
                return () => document.removeEventListener("mousedown", handleClickOutside);
        }, [popover, closeFilterModal]);

        return (
                <>
                        <div
                                className={`flex w-auto justify-center items-center rounded-md py-1 px-2 cursor-pointer gap-1.5 hover:bg-[#eceff1] ${isActive && !activeBackgroundColor ? "bg-[#b1edd0]" : ""}`}
                                style={
                                        isActive && activeBackgroundColor
                                                ? {
                                                                backgroundColor: activeBackgroundColor,
                                                                border: `1.5px solid ${activeBackgroundColor === "#eff6ff" ? "#3b82f6" : "#fbbf24"}`,
                                                        }
                                                : undefined
                                }
                                onClick={() => handleClick()}
                                ref={filterRef}
                                data-testid="filter-option"
                        >
                                <div className="mt-[0.1875rem]">
                                        <ODSIcon
                                                outeIconName="OUTEFilterIcon"
                                                outeIconProps={{
                                                        className: "h-5 w-5 text-[#263238]",
                                                }}
                                        />
                                </div>
                                <div className="text-[#263238] text-center tracking-[var(--subtitle2-letter-spacing)] whitespace-nowrap overflow-hidden text-ellipsis max-w-[25rem] text-sm">
                                        {getFilterSummary({ filter: originalFilterForActiveState })}
                                </div>
                        </div>

                        {popover && (
                                <div
                                        ref={popoverRef}
                                        className="fixed z-[200] mt-3.5"
                                        style={{
                                                top: filterRef.current ? filterRef.current.getBoundingClientRect().bottom : 0,
                                                left: filterRef.current ? filterRef.current.getBoundingClientRect().left : 0,
                                        }}
                                >
                                        <div className="bg-white border border-[#e5e7eb] rounded-lg shadow-[0_0.25rem_0.5rem_rgba(0,0,0,0.1),0_0.5rem_1.5rem_rgba(0,0,0,0.08),0_1rem_3rem_rgba(0,0,0,0.06)]">
                                                <div className="min-w-[38.5rem] w-[50rem]">
                                                        <div className="p-5 max-h-[30.75rem] overflow-y-auto">
                                                                <ConditionComposer
                                                                        key={filterKey}
                                                                        initialValue={updatedFilter || {}}
                                                                        schema={schema}
                                                                        ref={conditionRef}
                                                                />
                                                        </div>

                                                        <div className="flex justify-end items-center gap-6 p-6 border-t border-[#cfd8dc]">
                                                                <Button
                                                                        variant="outline"
                                                                        onClick={() => {
                                                                                setPopover(false);
                                                                                closeFilterModal();
                                                                        }}
                                                                        disabled={filterLoading}
                                                                        className="text-sm font-medium py-[0.4375rem] px-4 rounded-md normal-case"
                                                                >
                                                                        CANCEL
                                                                </Button>
                                                                <Button
                                                                        variant="default"
                                                                        onClick={onApplyHandler}
                                                                        disabled={filterLoading}
                                                                        className="text-sm font-medium py-[0.4375rem] px-4 rounded-md normal-case"
                                                                >
                                                                        {filterLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                                        APPLY FILTER
                                                                </Button>
                                                        </div>
                                                </div>
                                        </div>
                                </div>
                        )}
                </>
        );
};

export default memo(Filter);
