import ODSButton from "oute-ds-button";
import CheckBox from "oute-ds-checkbox";
import LoadingButton from "oute-ds-loading-button";
import React from "react";

import styles from "./styles.module.scss";

function Footer({
	isDontAskChecked,
	setIsDontAskChecked,
	onSave = () => {},
	onClose = () => {},
	footerLabel = "",
	loading = false,
	showCheckbox = true,
}) {
	return (
		<div
			className={`${styles.footer_container} ${showCheckbox ? styles.footer_container_with_checkbox : ""}`}
		>
			{showCheckbox && (
				<CheckBox
					data-outside-ignore="delete-modal-checkbox"
					labelText="Don’t show this message again"
					labelProps={{ variant: "subtitle1" }}
					checked={isDontAskChecked}
					onChange={(e) => {
						setIsDontAskChecked(e.target.checked);
					}}
					sx={{
						"&.Mui-checked": {
							color: "black",
						},
					}}
					disabled={loading}
				/>
			)}

			<div className={styles.flex_container}>
				<ODSButton
					data-outside-ignore="cancel-button"
					variant="outlined"
					label={"CANCEL"}
					onClick={onClose}
					disabled={loading}
					sx={{
						color: "#607D8B",
						fontFamily: "Inter",
						fontWeight: 600,
						border: "0.0625rem solid #B0BEC5",
					}}
				/>

				<LoadingButton
					onClick={onSave}
					color="error"
					loading={loading}
					label={footerLabel}
					sx={{
						fontFamily: "Inter",
						fontWeight: 600,
					}}
				/>
			</div>
		</div>
	);
}

export default Footer;
