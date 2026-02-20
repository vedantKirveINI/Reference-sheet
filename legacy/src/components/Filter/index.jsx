import { ConditionComposer } from "@oute/oute-ds.molecule.condition-composer";
import { isEmpty } from "lodash";
import Button from "oute-ds-button";
import Icon from "oute-ds-icon";
import LoadingButton from "oute-ds-loading-button";
import Popover from "oute-ds-popover";
import React, { useRef, useState, memo, useMemo, useEffect } from "react";

import styles from "./styles.module.scss";
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
					<Icon
						outeIconName="OUTEFilterIcon"
						outeIconProps={{
							sx: {
								height: "1.25rem",
								width: "1.25rem",
								color: "#263238",
							},
						}}
					/>
				</div>
				<div className={styles.filter_option_label}>
					{getFilterSummary({ filter: originalFilterForActiveState })}
				</div>
			</div>

			<Popover
				open={popover}
				anchorEl={filterRef.current}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				placement="bottom-start"
				sx={{
					zIndex: 200,
				}}
				slotProps={{
					paper: {
						sx: {
							border: "0.0625rem solid #e5e7eb",
							marginTop: "0.875rem",
							borderRadius: "0.5rem",
							boxShadow:
								"0 0.25rem 0.5rem rgba(0, 0, 0, 0.1), 0 0.5rem 1.5rem rgba(0, 0, 0, 0.08), 0 1rem 3rem rgba(0, 0, 0, 0.06)",
						},
					},
				}}
				onClose={() => {
					setPopover(false);
					closeFilterModal();
				}}
			>
				<div className={styles.popper_container}>
					<div className={styles.popper_content}>
						<ConditionComposer
							key={filterKey}
							initialValue={updatedFilter || {}}
							schema={schema}
							ref={conditionRef}
						/>
					</div>

					<div className={styles.popper_footer}>
						<Button
							variant="black-outlined"
							onClick={() => {
								setPopover(false);
								closeFilterModal();
							}}
							disabled={filterLoading}
							sx={{
								fontSize: "0.875rem",
								fontWeight: "500",
								padding: "0.4375rem 1rem",
								borderRadius: "0.375rem",
								textTransform: "none",
							}}
						>
							CANCEL
						</Button>
						<LoadingButton
							variant="black"
							onClick={onApplyHandler}
							loading={filterLoading}
							label="APPLY FILTER"
							sx={{
								fontSize: "0.875rem",
								fontWeight: "500",
								padding: "0.4375rem 1rem",
								borderRadius: "0.375rem",
								textTransform: "none",
							}}
						/>
					</div>
				</div>
			</Popover>
		</>
	);
};

export default memo(Filter);
