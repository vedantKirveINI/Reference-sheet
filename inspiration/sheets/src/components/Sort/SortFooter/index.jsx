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
			/>
			<LoadingButton
				variant="black"
				label="SORT"
				onClick={onSort}
				loading={loading}
			/>
		</div>
	);
};

export default SortFooter;
