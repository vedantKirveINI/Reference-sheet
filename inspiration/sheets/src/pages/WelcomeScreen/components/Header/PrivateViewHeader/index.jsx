import ODSCommonAccountAction from "@oute/icdeployment.molecule.common-account-actions";
import ODSButton from "oute-ds-button";
import ODSIcon from "oute-ds-icon";
import ODSTextField from "oute-ds-text-field";

import styles from "./styles.module.scss";

function PrivateViewHeader({
	name = "",
	handleNameEdit = () => {},
	saveSheetName = () => {},
	textFieldRef = null,
	show = () => {},
	onHelpClick = () => {},
	onShareClick = () => {},
	isMobile = false,
}) {
	return (
		<>
			<div className={styles.title}>
				<ODSIcon
					outeIconName="TINYSheetIcon"
					outeIconProps={{
						sx: { width: "2.25rem", height: "2.25rem" },
						"aria-label": "TINYTable Logo",
					}}
				/>

				<ODSTextField
					className="black"
					data-testid="sheet-title-input"
					aria-label="Sheet Name"
					sx={{
						"& .MuiOutlinedInput-root": {
							padding: "0.375rem 0.625rem",
							"& fieldset": {
								borderWidth: "0rem",
							},
							"&:hover": {
								background: "#eceff1",
							},
						},
						width: `${name?.length + 1}ch`,
						minWidth: "16ch",
						maxWidth: isMobile ? "30rem" : "44.875rem",
					}}
					value={name}
					onChange={handleNameEdit}
					onBlur={() => {
						saveSheetName();
					}}
					inputProps={{
						style: {
							fontSize: "1rem",
							fontWeight: "500",
							overflow: "hidden",
							textOverflow: "ellipsis",
						},
						ref: textFieldRef,
					}}
				/>
			</div>

			<nav className={styles.header_actions_container}>
				<ul className={styles.action_list}>
					{!isMobile && (
						<>
							<li>
								<ODSIcon
									outeIconName="OUTESupportAgentIcon"
									outeIconProps={{
										sx: {
											width: "1.75rem",
											height: "1.75rem",
											color: "#212121",
										},
									}}
									buttonProps={{
										sx: {
											padding: 0,
										},
									}}
									onClick={() => {
										show();
									}}
								/>
							</li>
							<li>
								<ODSButton
									label="HELP"
									variant="black-text"
									aria-label="Help"
									sx={{
										gap: "0.75rem",
										fontSize: "0.875rem",
									}}
									startIcon={
										<ODSIcon
											outeIconName="OUTEHelpIcon"
											outeIconProps={{
												sx: {
													color: "#212121",
													width: "1.5rem",
													height: "1.5rem",
												},
											}}
										/>
									}
									onClick={onHelpClick}
								/>
							</li>
							<li>
								<ODSButton
									onClick={onShareClick}
									label="SHARE"
									sx={{
										gap: "0.75rem",
										fontSize: "0.875rem",
									}}
									variant="black"
									data-testid="share-button"
									startIcon={
										<ODSIcon
											outeIconName="OUTEShareIcon"
											outeIconProps={{
												sx: {
													color: "#ffffff",
													width: "1.5rem",
													height: "1.5rem",
												},
											}}
										/>
									}
								/>
							</li>
						</>
					)}

					<li>
						<ODSCommonAccountAction
							avatarProps={{
								sx: {
									width: "2.5rem",
									height: "2.5rem",
								},
							}}
						/>
					</li>
				</ul>
			</nav>
		</>
	);
}

export default PrivateViewHeader;
