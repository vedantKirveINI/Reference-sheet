import { isEmpty } from "lodash";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter as FilterIcon } from "lucide-react";
import React, { useRef, useState, memo, useMemo, useEffect } from "react";

import styles from "./styles.module.scss";
import useFilterData from "./useFilterData";
import getFilterSummary from "./utils/getFilterSumary";
import { useModalControlStore } from "@/stores/modalControlStore";

const ConditionComposerPlaceholder = React.forwardRef(({ initialValue, schema }, ref) => {
	const [conditions, setConditions] = React.useState(initialValue?.childs || []);

	React.useImperativeHandle(ref, () => ({
		getConditions: () => ({
			...initialValue,
			childs: conditions,
		}),
		getValue: () => ({
			...initialValue,
			childs: conditions,
		}),
	}));

	return (
		<div style={{ padding: "8px", minWidth: "300px" }}>
			<div style={{ fontSize: "13px", color: "#666", marginBottom: "8px" }}>
				{conditions.length === 0
					? "No filter conditions. Add conditions to filter records."
					: `${conditions.length} filter condition${conditions.length !== 1 ? "s" : ""} active`}
			</div>
			{conditions.map((condition, index) => (
				<div
					key={index}
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
						padding: "6px 8px",
						marginBottom: "4px",
						border: "1px solid #e0e0e0",
						borderRadius: "4px",
						fontSize: "13px",
					}}
				>
					<span style={{ flex: 1 }}>
						{condition.field?.label || condition.fieldId || "Field"}{" "}
						{condition.operator || "contains"}{" "}
						{condition.value || "..."}
					</span>
					<button
						onClick={() => {
							const newConditions = conditions.filter((_, i) => i !== index);
							setConditions(newConditions);
						}}
						style={{
							border: "none",
							background: "transparent",
							cursor: "pointer",
							color: "#999",
							fontSize: "16px",
						}}
					>
						×
					</button>
				</div>
			))}
		</div>
	);
});

ConditionComposerPlaceholder.displayName = "ConditionComposerPlaceholder";

const Filter = ({
	filter = {},
	fields = [],
	onFilterChange = () => {},
	activeBackgroundColor,
}) => {
	const [popover, setPopover] = useState(false);
	const filterRef = useRef(null);
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

	return (
		<>
			<div
				className={`${styles.filter_option} ${
					isActive && !activeBackgroundColor
						? styles.filter_view_highlight
						: ""
				}`}
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
				<div className={styles.filter_option_icon}>
					<FilterIcon
						style={{
							height: "1.25rem",
							width: "1.25rem",
							color: "#263238",
						}}
					/>
				</div>
				<div className={styles.filter_option_label}>
					{getFilterSummary({ filter: originalFilterForActiveState })}
				</div>
			</div>

			<Popover open={popover} onOpenChange={(open) => { if (!open) { setPopover(false); closeFilterModal(); } }}>
				<PopoverTrigger asChild>
					<span style={{ display: "none" }} />
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="p-0"
					style={{
						border: "0.0625rem solid #e5e7eb",
						borderRadius: "0.5rem",
						boxShadow: "0 0.25rem 0.5rem rgba(0, 0, 0, 0.1), 0 0.5rem 1.5rem rgba(0, 0, 0, 0.08), 0 1rem 3rem rgba(0, 0, 0, 0.06)",
						width: "auto",
						maxWidth: "none",
					}}
				>
					<div className={styles.popper_container}>
						<div className={styles.popper_content}>
							<ConditionComposerPlaceholder
								key={filterKey}
								initialValue={updatedFilter || {}}
								schema={schema}
								ref={conditionRef}
							/>
						</div>

						<div className={styles.popper_footer}>
							<Button
								variant="outline"
								onClick={() => {
									setPopover(false);
									closeFilterModal();
								}}
								disabled={filterLoading}
								style={{
									fontSize: "0.875rem",
									fontWeight: "500",
									textTransform: "none",
								}}
							>
								CANCEL
							</Button>
							<Button
								onClick={onApplyHandler}
								disabled={filterLoading}
								style={{
									fontSize: "0.875rem",
									fontWeight: "500",
									textTransform: "none",
								}}
							>
								{filterLoading ? "..." : "APPLY FILTER"}
							</Button>
						</div>
					</div>
				</PopoverContent>
			</Popover>
		</>
	);
};

export default memo(Filter);
