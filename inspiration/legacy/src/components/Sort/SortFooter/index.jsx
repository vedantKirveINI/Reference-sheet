import ODSButton from "oute-ds-button";
import LoadingButton from "oute-ds-loading-button";
import React from "react";

import styles from "./styles.module.scss";

const SortFooter = ({
	onSort = () => {},
	onClose = () => {},
	loading = false,
}) => {
	return (
		<div className={styles.footer_container}>
			<ODSButton
				variant="black-outlined"
				label="CANCEL"
				onClick={onClose}
				sx={{
					fontSize: "0.875rem",
					fontWeight: "500",
					padding: "0.4375rem 1rem",
					borderRadius: "0.375rem",
					textTransform: "none",
				}}
			/>
			<LoadingButton
				variant="black"
				label="SORT"
				onClick={onSort}
				loading={loading}
				sx={{
					fontSize: "0.875rem",
					fontWeight: "500",
					padding: "0.4375rem 1rem",
					borderRadius: "0.375rem",
					textTransform: "none",
				}}
			/>
		</div>
	);
};

export default SortFooter;
