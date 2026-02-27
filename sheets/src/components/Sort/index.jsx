import { isEmpty } from "lodash";
import Icon from "oute-ds-icon";
import Popover from "oute-ds-popover";
import React, { useRef, useState, memo } from "react";

import useSort from "./hooks/useSort";
import SortContent from "./SortContent/index";
import styles from "./styles.module.scss";

const SortModal = ({ sort = {}, fields = [] }) => {
	const [isOpen, setIsOpen] = useState(false);

	const {
		sortFields = () => {},
		handleClick = () => {},
		loading = false,
		getSortTitle,
		updatedSortObjs,
		sortFieldOptions,
	} = useSort({
		isOpen,
		setIsOpen,
		sort,
		fields,
	});

	const sortRef = useRef(null);

	return (
		<>
			<div
				className={`${styles.sort_option} ${
					!isEmpty(updatedSortObjs)
						? styles.sort_view_highlighted
						: ""
				}`}
				onClick={() => handleClick()}
				ref={sortRef}
				data-testid="sort-option"
			>
				<div className={styles.sort_option_icon}>
					<Icon
						outeIconName="OUTESwapHorizontal"
						outeIconProps={{
							sx: {
								transform: "rotate(90deg)",
								width: "1.125rem",
								height: "1.125rem",
								color: "var(--cell-text-primary-color)",
							},
						}}
					/>
				</div>
				<div className={styles.sort_option_label}>{getSortTitle()}</div>
			</div>

			<Popover
				open={isOpen}
				anchorEl={sortRef?.current}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				placement="bottom-start"
				onClose={() => {
					setIsOpen(false);
				}}
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
			>
				<SortContent
					updatedSortObjs={updatedSortObjs}
					sortFieldOptions={sortFieldOptions}
					onClose={() => setIsOpen(false)}
					onSave={sortFields}
					loading={loading}
				/>
			</Popover>
		</>
	);
};

export default memo(SortModal);
