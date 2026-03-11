import React from "react";
import Button from "oute-ds-button";

import styles from "./styles.module.scss";

function GroupByFooter({
	onGroupBy = () => {},
	onClose = () => {},
	loading = false,
}) {
	return (
		<div className={styles.group_by_footer_container}>
			<Button
				variant="outlined"
				size="small"
				onClick={onClose}
				disabled={loading}
				sx={{
					marginRight: "0.5rem",
					textTransform: "none",
					borderColor: "#CFD8DC",
					color: "var(--cell-text-primary-color)",
					"&:hover": {
						borderColor: "#CFD8DC",
					},
				}}
			>
				Cancel
			</Button>
			<Button
				variant="contained"
				size="small"
				onClick={onGroupBy}
				disabled={loading}
				sx={{
					textTransform: "none",
					backgroundColor: "#212121",
					"&:hover": {
						backgroundColor: "#212121",
					},
				}}
			>
				Apply
			</Button>
		</div>
	);
}

export default GroupByFooter;

