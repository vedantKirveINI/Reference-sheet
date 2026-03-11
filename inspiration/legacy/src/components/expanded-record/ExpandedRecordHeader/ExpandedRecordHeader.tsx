// Expanded Record Header Component
// Displays title, navigation buttons, and action buttons

import React, { useState } from "react";
import ODSButton from "oute-ds-button";
import ODSIcon from "oute-ds-icon";
import ODSTooltip from "oute-ds-tooltip";
import Popover from "@mui/material/Popover";
// import MenuItem from "@mui/material/MenuItem";
// import ListItemIcon from "@mui/material/ListItemIcon";
// import ListItemText from "@mui/material/ListItemText";
import ODSLabel from "oute-ds-label";
import styles from "./ExpandedRecordHeader.module.scss";

interface IExpandedRecordHeaderProps {
	title: string;
	onClose: () => void;
	onPrev?: () => void;
	onNext?: () => void;
	disabledPrev?: boolean;
	disabledNext?: boolean;
	onDelete?: () => void;
	onDuplicate?: () => void;
	onCopyUrl?: () => void;
	canDelete?: boolean;
	canDuplicate?: boolean;
}

/**
 * ExpandedRecordHeader - Header component with title and actions
 *
 * Phase 4: Complete header with navigation and actions
 */
export const ExpandedRecordHeader: React.FC<IExpandedRecordHeaderProps> = ({
	title,
	onClose,
	onPrev,
	onNext,
	disabledPrev = true,
	disabledNext = true,
	onDelete,
	onDuplicate,
	onCopyUrl,
	canDelete = false,
	canDuplicate = false,
}) => {
	const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement | null>(
		null,
	);

	const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setMenuAnchor(event.currentTarget);
	};

	const handleMenuClose = () => {
		setMenuAnchor(null);
	};

	const handleDelete = () => {
		handleMenuClose();
		onDelete?.();
	};

	const handleDuplicate = () => {
		handleMenuClose();
		onDuplicate?.();
	};

	const handleCopyUrl = () => {
		handleMenuClose();
		onCopyUrl?.();
	};

	return (
		<div className={styles.header}>
			<div className={styles.header_left}>
				{/* Navigation buttons */}
				{onPrev && (
					<ODSTooltip title="Previous Record" placement="top">
						<ODSButton
							variant="black-text"
							onClick={onPrev}
							disabled={disabledPrev}
							startIcon={
								<ODSIcon
									outeIconName="OUTEExpandLessIcon"
									outeIconProps={{
										sx: {
											width: "1.25rem",
											height: "1.25rem",
											color: disabledPrev
												? "#bdbdbd"
												: "#424242",
										},
									}}
								/>
							}
							sx={{
								minWidth: "auto",
								padding: "0.25rem",
								height: "auto",
								"&:hover": {
									backgroundColor: "rgba(0, 0, 0, 0.04)",
								},
							}}
						/>
					</ODSTooltip>
				)}
				{onNext && (
					<ODSTooltip title="Next Record" placement="bottom">
						<ODSButton
							variant="black-text"
							onClick={onNext}
							disabled={disabledNext}
							startIcon={
								<ODSIcon
									outeIconName="OUTEExpandMoreIcon"
									outeIconProps={{
										sx: {
											width: "1.25rem",
											height: "1.25rem",
											color: disabledNext
												? "#bdbdbd"
												: "#424242",
										},
									}}
								/>
							}
							sx={{
								minWidth: "auto",
								padding: "0.25rem",
								height: "auto",
								"&:hover": {
									backgroundColor: "rgba(0, 0, 0, 0.04)",
								},
							}}
						/>
					</ODSTooltip>
				)}

				<ODSLabel
					variant="h6"
					sx={{
						fontFamily: "Inter",
						marginLeft: "0.5rem",
					}}
					className={styles.title}
				>
					{title}
				</ODSLabel>
			</div>

			<div className={styles.header_right}>
				{/* Copy URL button */}
				{onCopyUrl && (
					<ODSButton
						variant="text"
						onClick={handleCopyUrl}
						sx={{
							minWidth: "auto",
							padding: "0.5rem",
							"&:hover": {
								backgroundColor: "rgba(0, 0, 0, 0.04)",
							},
						}}
					>
						<ODSIcon
							outeIconName="Link"
							outeIconProps={{
								sx: {
									width: "1rem",
									height: "1rem",
									color: "#424242",
								},
							}}
						/>
					</ODSButton>
				)}

				{/* More actions menu (Delete, Duplicate) */}
				{(canDelete || canDuplicate) && (
					<>
						<ODSButton
							variant="text"
							onClick={handleMenuOpen}
							sx={{
								minWidth: "auto",
								padding: "0.5rem",
								"&:hover": {
									backgroundColor: "rgba(0, 0, 0, 0.04)",
								},
							}}
						>
							<ODSIcon
								outeIconName="MoreHorizontal"
								outeIconProps={{
									sx: {
										width: "1rem",
										height: "1rem",
										color: "#424242",
									},
								}}
							/>
						</ODSButton>
						<Popover
							open={Boolean(menuAnchor)}
							anchorEl={menuAnchor}
							onClose={handleMenuClose}
							anchorOrigin={{
								vertical: "bottom",
								horizontal: "right",
							}}
							transformOrigin={{
								vertical: "top",
								horizontal: "right",
							}}
							slotProps={{
								paper: {
									style: {
										minWidth: "180px",
										padding: "4px 0",
										boxShadow:
											"0px 4px 6px rgba(0, 0, 0, 0.1)",
										border: "0.0625rem solid #e5e7eb",
									},
								},
							}}
						>
							{canDuplicate && onDuplicate && (
								// <MenuItem
								// 	onClick={handleDuplicate}
								// 	sx={{
								// 		padding: "0.5rem 0.75rem",
								// 		minHeight: "36px",
								// 		"&:hover": {
								// 			backgroundColor: "#f5f5f5",
								// 		},
								// 	}}
								// >
								// 	<ListItemIcon sx={{ minWidth: "32px" }}>
								// 		<ODSIcon
								// 			outeIconName="Copy"
								// 			outeIconProps={{
								// 				sx: {
								// 					color: "#90A4AE",
								// 					width: "1rem",
								// 					height: "1rem",
								// 				},
								// 			}}
								// 		/>
								// 	</ListItemIcon>
								// 	<ListItemText
								// 		primary={
								// 			<ODSLabel
								// 				variant="body2"
								// 				sx={{
								// 					fontFamily: "Inter",
								// 					fontSize: "13px",
								// 					fontWeight: "400",
								// 				}}
								// 				color="#212121"
								// 			>
								// 				Duplicate Record
								// 			</ODSLabel>
								// 		}
								// 	/>
								// </MenuItem>
								<></>
							)}
							{canDelete && onDelete && (
								//  <MenuItem
								// 	onClick={handleDelete}
								// 	sx={{
								// 		padding: "0.5rem 0.75rem",
								// 		minHeight: "36px",
								// 		"&:hover": {
								// 			backgroundColor: "#f5f5f5",
								// 		},
								// 	}}
								// >
								// 	<ListItemIcon sx={{ minWidth: "32px" }}>
								// 		<ODSIcon
								// 			outeIconName="Trash2"
								// 			outeIconProps={{
								// 				sx: {
								// 					color: "#F44336",
								// 					width: "1rem",
								// 					height: "1rem",
								// 				},
								// 			}}
								// 		/>
								// 	</ListItemIcon>
								// 	<ListItemText
								// 		primary={
								// 			<ODSLabel
								// 				variant="body2"
								// 				sx={{
								// 					fontFamily: "Inter",
								// 					fontSize: "13px",
								// 					fontWeight: "400",
								// 				}}
								// 				color="#F44336"
								// 			>
								// 				Delete Record
								// 			</ODSLabel>
								// 		}
								// 	/>
								// </MenuItem>
								<></>
							)}
						</Popover>
					</>
				)}

				{/* Close button */}
				<ODSButton
					variant="text"
					onClick={onClose}
					sx={{
						minWidth: "auto",
						padding: "0.5rem",
						"&:hover": {
							backgroundColor: "rgba(0, 0, 0, 0.04)",
						},
					}}
				>
					<ODSIcon
						outeIconName="X"
						outeIconProps={{
							sx: {
								width: "1rem",
								height: "1rem",
								color: "#424242",
							},
						}}
					/>
				</ODSButton>
			</div>
		</div>
	);
};
