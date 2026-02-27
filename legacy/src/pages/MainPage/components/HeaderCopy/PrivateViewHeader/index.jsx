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
						sx: { width: "2rem", height: "2rem" },
						"aria-label": "TINYTable Logo",
					}}
				/>

				<ODSTextField
					className="black"
					data-testid="sheet-title-input"
					aria-label="Sheet Name"
					sx={{
						"& .MuiOutlinedInput-root": {
							padding: "0.5rem 0.75rem",
							"& fieldset": {
								borderWidth: "0rem",
							},
							"&:hover": {
								background: "#f5f5f5",
							},
							"&:focus-within": {
								background: "#fafafa",
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
							fontSize: "1.125rem",
							fontWeight: "600",
							overflow: "hidden",
							textOverflow: "ellipsis",
							color: "#212121",
							letterSpacing: "-0.01em",
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
											width: "1.5rem",
											height: "1.5rem",
											color: "#666666",
											transition: "color 0.2s ease",
										},
									}}
									buttonProps={{
										sx: {
											padding: "0.5rem",
											borderRadius: "8px",
											"&:hover": {
												backgroundColor: "#f5f5f5",
											},
										},
									}}
									onClick={() => {
										show();
									}}
								/>
							</li>
							<li>
								<ODSButton
									label="Help"
									variant="black-text"
									aria-label="Help"
									sx={{
										gap: "0.5rem",
										fontSize: "0.875rem",
										fontWeight: "500",
										padding: "0.5rem 0.75rem",
										borderRadius: "8px",
										textTransform: "none",
										"&:hover": {
											backgroundColor: "#f5f5f5",
										},
									}}
									startIcon={
										<ODSIcon
											outeIconName="OUTEHelpIcon"
											outeIconProps={{
												sx: {
													color: "#666666",
													width: "1.25rem",
													height: "1.25rem",
												},
											}}
										/>
									}
									onClick={onHelpClick}
								/>
							</li>
							<li>
								<ODSButton
									label="SHARE"
									variant="primary"
									aria-label="Share"
									data-testid="share-button"
									sx={{
										fontSize: "0.875rem",
										fontWeight: "600",
										padding: "0.625rem 1.25rem",
										borderRadius: "0.375rem",
										textTransform: "none",
										background:
											"linear-gradient(90deg, #389b6a 3%)",
										color: "#ffffff",
										boxShadow:
											"0 2px 4px rgba(56, 155, 106, 0.3)",
										transition: "all 0.2s ease",
										"&:hover": {
											background:
												"linear-gradient( #389b6a 49%)",
											boxShadow:
												"0 4px 8px rgba(56, 155, 106, 0.4)",
											transform: "translateY(-1px)",
										},
										"&:active": {
											transform: "translateY(0)",
											boxShadow:
												"0 2px 4px rgba(56, 155, 106, 0.3)",
										},
									}}
									onClick={onShareClick}
								/>
							</li>
						</>
					)}
				</ul>
			</nav>
		</>
	);
}

export default PrivateViewHeader;
