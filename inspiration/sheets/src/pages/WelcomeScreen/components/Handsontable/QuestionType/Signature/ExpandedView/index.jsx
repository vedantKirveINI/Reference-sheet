import ODSButton from "oute-ds-button";
import Icon from "oute-ds-icon";
import Label from "oute-ds-label";
import React from "react";

import SignatureIcon from "../../../../../../../assets/question-type-icons/signature.svg";

import styles from "./styles.module.scss";

const ExpandedView = ({
	initialValue = "",
	variant = "black",
	label = "EDIT",
	setIsExpanded = () => {},
	openDialog = () => {},
}) => {
	return (
		<div className={styles.expanded_view}>
			<div className={styles.title_container}>
				<div className={styles.title}>
					<Icon
						imageProps={{
							src: SignatureIcon,
							className: styles.signature_icon,
						}}
					/>
					<Label variant="subtitle1" sx={{ fontFamily: "Inter" }}>
						Signature
					</Label>
				</div>

				<Icon
					outeIconName="OUTECloseIcon"
					onClick={() => setIsExpanded(() => "")}
					outeIconProps={{
						sx: {
							cursor: "pointer",
						},
					}}
					buttonProps={{
						sx: {
							padding: 0,
						},
					}}
				/>
			</div>

			<Icon
				imageProps={{
					src: initialValue,
					className: styles.signature_url_img,
				}}
			/>

			<ODSButton
				variant={variant}
				label={label}
				onClick={openDialog}
				startIcon={
					<Icon
						outeIconName="OUTEEditIcon"
						outeIconProps={{
							sx: {
								color: "#ffffff",
							},
						}}
					/>
				}
			/>
		</div>
	);
};

export default ExpandedView;
