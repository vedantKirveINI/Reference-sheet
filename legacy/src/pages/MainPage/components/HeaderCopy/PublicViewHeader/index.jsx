import ODSButton from "oute-ds-button";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";

import styles from "./styles.module.scss";

function PublicViewHeader({
	name = "",
	onHelpClick = () => {},
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

				<ODSLabel
					variant="h6"
					sx={{
						fontFamily: "Inter",
						fontWeight: "400",
						maxWidth: isMobile ? "20rem" : "44.875rem",
						overflow: "hidden",
						textOverflow: "ellipsis",
						whiteSpace: "nowrap",
						width: "100%",
					}}
				>
					{name}
				</ODSLabel>
			</div>

			<nav className={styles.header_actions_container}>
				<ul className={styles.action_list}>
					<li>
						<ODSButton
							variant="black"
							label="View only"
							startIcon={
								<ODSIcon
									outeIconName="OUTEInfoIcon"
									outeIconProps={{
										sx: {
											color: "#212121",
											width: "1.5rem",
											height: "1.5rem",
										},
									}}
								/>
							}
							sx={{
								backgroundColor: "#ECEFF1",
								color: "#212121",
								fontWeight: "400",
								fontFamily: "Inter",
								fontSize: "0.875rem",
								"&:hover": {
									background: "#ECEFF1",
								},
							}}
						/>
					</li>
					<li>
						<ODSButton
							label="HELP"
							variant="black-text"
							aria-label="Help"
							sx={{ gap: "0.75rem", fontSize: "0.875rem" }}
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
				</ul>
			</nav>
		</>
	);
}

export default PublicViewHeader;
