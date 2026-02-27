import { ConditionComposer } from "@oute/oute-ds.molecule.condition-composer";
import { isEmpty } from "lodash";
import Button from "oute-ds-button";
import Icon from "oute-ds-icon";
import LoadingButton from "oute-ds-loading-button";
import Popover from "oute-ds-popover";
import React, { useRef, useState, memo, useMemo } from "react";

import styles from "./styles.module.scss";
import useFilterData from "./useFilterData";
import getFilterSummary from "./utils/getFilterSumary";

const Filter = ({ filter = {}, fields = [] }) => {
	const [popover, setPopover] = useState(false);
	const filterRef = useRef(null);

	const {
		schema = [],
		onApplyHandler = () => {},
		conditionRef,
		filterLoading = false,
		handleClick = () => {},
		getUpdatedFilter = () => {},
	} = useFilterData({
		setPopover,
		fields,
	});

	const updatedFilter = useMemo(() => {
		return getUpdatedFilter({ filter });
	}, [filter]);

	return (
		<>
			<div
				className={`${styles.filter_option} ${
					!isEmpty(updatedFilter?.childs)
						? styles.filter_view_highlight
						: ""
				}`}
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
					{getFilterSummary({ filter: updatedFilter })}
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
							border: "0.047rem solid #CFD8DC",
							marginTop: "0.875rem",
						},
					},
				}}
				onClose={() => {
					setPopover((prev) => !prev);
				}}
			>
				<div className={styles.popper_container}>
					<div className={styles.popper_content}>
						<ConditionComposer
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
							}}
							disabled={filterLoading}
						>
							CANCEL
						</Button>
						<LoadingButton
							variant="black"
							onClick={onApplyHandler}
							loading={filterLoading}
							label="APPLY FILTER"
						/>
					</div>
				</div>
			</Popover>
		</>
	);
};

export default memo(Filter);
