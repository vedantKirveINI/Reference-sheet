import ODSButton from "oute-ds-button";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import ODSLoadingButton from "oute-ds-loading-button";

import styles from "./styles.module.scss";

function DialogActions({
	handleSubmit = () => {},
	hasModifiedUsers = false,
	loading = false,
	handleCopyLink = () => {},
	isLinkCopied = false,
}) {
	return (
		<div className={styles.footer_container}>
			<div className={styles.left_action_footer}>
				{isLinkCopied ? (
					<div className={styles.copy_link_container}>
						<ODSIcon
							outeIconName="OUTEDoneIcon"
							outeIconProps={{
								sx: {
									color: "#29CC6A",
								},
							}}
						/>
						<ODSLabel variant="capital" color="#212121">
							Link copied to your clipboard
						</ODSLabel>
					</div>
				) : (
					<ODSButton
						variant="black-text"
						label="COPY LINK"
						data-testid="copy-link-button"
						disabled={loading}
						onClick={handleCopyLink}
						startIcon={
							<ODSIcon
								outeIconName="OUTEInsertLinkIcon"
								outeIconProps={{
									sx: {
										color: "#212121",
									},
								}}
							/>
						}
					/>
				)}
			</div>

			<div className={styles.right_action_footer}>
				{hasModifiedUsers && (
					<ODSLabel variant="subtitle1" color="#607D8B">
						Pending changes
					</ODSLabel>
				)}

				<ODSLoadingButton
					variant="black"
					label="SAVE"
					disabled={!hasModifiedUsers}
					onClick={handleSubmit}
					loading={loading}
				/>
			</div>
		</div>
	);
}

export default DialogActions;
