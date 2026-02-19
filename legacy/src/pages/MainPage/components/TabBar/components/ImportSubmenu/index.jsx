import { MenuItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import ODSPopover from "oute-ds-popover";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";

import ComingSoonTag from "../../../../../../components/common/ComingSoonTag";
import { importOptions } from "../../configuration/importOptions";

import styles from "./styles.module.scss";

function ImportSubmenu({
	open = false,
	anchorPosition = null,
	onClose = () => {},
	setImportSource = () => {},
	setImportModalOpen = () => {},
}) {
	if (!open || !anchorPosition) return null;

	return (
		<ODSPopover
			open={open}
			anchorReference="anchorPosition"
			anchorPosition={anchorPosition}
			onClose={onClose}
			anchorOrigin={{
				vertical: "top",
				horizontal: "right",
			}}
			transformOrigin={{
				vertical: "top",
				horizontal: "left",
			}}
			slotProps={{
				paper: {
					style: {
						minWidth: "200px",
						padding: "4px 0",
						boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
					},
				},
			}}
		>
			{importOptions.map((option, index) => {
				const rightAdornments = [];
				if (option.hasTeamBadge) {
					rightAdornments.push(
						<div
							key="team-badge"
							className={styles.team_badge}
						>
							Team
						</div>,
					);
				}
				if (option.hasComingSoon) {
					rightAdornments.push(
						<ComingSoonTag
							key="coming-soon"
							text="Coming soon"
							variant="gray"
						/>,
					);
				}

				return (
					<div key={option.id}>
						<MenuItem
							onClick={() => {
								onClose();
								option.handler(setImportSource, setImportModalOpen);
							}}
							sx={{
								padding: "8px 16px",
								minHeight: "36px",
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
							}}
						>
							<div style={{ display: "flex", alignItems: "center", flex: 1 }}>
								<ListItemIcon sx={{ minWidth: "32px" }}>
									<ODSIcon
										outeIconName={option.iconName}
										outeIconProps={{
											sx: {
												width: "1rem",
												height: "1rem",
												color: "#90A4AE",
											},
										}}
									/>
								</ListItemIcon>
								<ListItemText
									primary={
										<ODSLabel
											variant="body2"
											sx={{
												fontFamily: "Inter",
												fontWeight: "400",
												fontSize: "13px",
											}}
											color="#212121"
										>
											{option.label}
										</ODSLabel>
									}
								/>
							</div>
							{rightAdornments.length > 0 && (
								<div
									style={{
										display: "flex",
										alignItems: "center",
										marginLeft: "8px",
										gap: "4px",
									}}
								>
									{rightAdornments}
								</div>
							)}
						</MenuItem>
					</div>
				);
			})}
		</ODSPopover>
	);
}

export default ImportSubmenu;

