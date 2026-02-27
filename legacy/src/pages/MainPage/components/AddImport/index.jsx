import ODSContextMenu from "oute-ds-context-menu";
import Icon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import Skeleton from "oute-ds-skeleton";
import ODSTooltip from "oute-ds-tooltip";
import React, { useMemo } from "react";

import ComingSoonTag from "../../../../components/common/ComingSoonTag";
import truncateName from "../../../../utils/truncateName";
import { importOptions } from "../TabBar/configuration/importOptions";

import AddTable from "./AddTable";
import useAddOrImport from "./hooks/useAddOrImport";
import ImportCSV from "./ImportCSV";
import styles from "./styles.module.scss";

const AnchorElement = ({ onClick }) => {
	return (
		<ODSTooltip title="Add or Import" placement="bottom">
			<div
				className={styles.add_import_container}
				role="button"
				tabIndex={0}
				aria-label="Add or import table"
				onClick={onClick}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						onClick();
					}
				}}
			>
				<Icon
					outeIconName="OUTEAddIcon"
					outeIconProps={{
						sx: {
							color: "#000",
							width: "1.25rem",
							height: "1.25rem",
							cursor: "pointer",
						},
					}}
				/>
			</div>
		</ODSTooltip>
	);
};

function AddImport({ baseId = "", setView = () => {}, leaveRoom }) {
	const {
		cord,
		open,
		source,
		selectedTableIdWithViewId,
		setCord = () => {},
		setOpen = () => {},
		setSource = () => {},
		setSelectedTableIdWithViewId = () => {},
		onAddOrImportClick = () => {},
		isTableListLoading = false,
		tableListData = [],
		currentTableId = "",
		currentViewId = "",
	} = useAddOrImport();

	const menus = useMemo(() => {
		const menuItems = [];

		// Section 1: Add a blank table
		menuItems.push({
			id: "section-header-1",
			name: (
				<ODSLabel
					variant="body2"
					sx={{
						fontFamily: "Inter",
						fontSize: "11px",
						fontWeight: "600",
						color: "#424242",
					}}
				>
					Add a blank table
				</ODSLabel>
			),
			onClick: () => {},
			disabled: true,
			sx: {
				paddingTop: "12px",
				paddingBottom: "4px",
				cursor: "default",
				"&:hover": { backgroundColor: "transparent" },
			},
		});

		menuItems.push({
			id: "start-from-scratch",
			name: (
				<ODSLabel
					variant="body2"
					sx={{
						fontFamily: "Inter",
						fontSize: "13px",
						fontWeight: "400",
					}}
					color="#212121"
				>
					Start from scratch
				</ODSLabel>
			),
			onClick: () => {
				setOpen("addTable");
			},
			leftAdornment: (
				<Icon
					outeIconName="OUTEAddIcon"
					outeIconProps={{
						sx: {
							color: "#90A4AE",
							width: "1rem",
							height: "1rem",
							cursor: "pointer",
						},
					}}
				/>
			),
			sx: {
				padding: "0.5rem 0.75rem",
				borderRadius: "0.375rem",
				margin: "0.125rem 0.5rem",
			},
		});

		// Divider
		menuItems.push({
			id: "divider-1",
			name: (
				<div
					style={{
						height: "1px",
						backgroundColor: "#E0E0E0",
						margin: "4px 0",
					}}
				/>
			),
			onClick: () => {},
			leftAdornment: null,
			disabled: true,
			sx: {
				cursor: "default",
				"&:hover": { backgroundColor: "transparent" },
			},
		});

		// Section 2: Import from CSV
		menuItems.push({
			id: "section-header-2",
			name: (
				<ODSLabel
					variant="body2"
					sx={{
						fontFamily: "Inter",
						fontSize: "11px",
						fontWeight: "600",
						color: "#424242",
					}}
				>
					Import from CSV
				</ODSLabel>
			),
			onClick: () => {},
			disabled: true,
			sx: {
				paddingTop: "12px",
				paddingBottom: "4px",
				cursor: "default",
				"&:hover": { backgroundColor: "transparent" },
			},
		});

		menuItems.push({
			id: "import-new-table",
			name: (
				<ODSLabel
					variant="body2"
					sx={{
						fontFamily: "Inter",
						fontSize: "13px",
						fontWeight: "400",
					}}
					color="#212121"
				>
					Import File into a new table
				</ODSLabel>
			),
			onClick: () => {
				setOpen("importTable");
				setSource("newTable");
			},
			leftAdornment: (
				<Icon
					outeIconName="OUTEDownloadIcon"
					outeIconProps={{
						sx: {
							color: "#90A4AE",
							width: "1rem",
							height: "1rem",
							cursor: "pointer",
						},
					}}
				/>
			),
			sx: {
				padding: "0.5rem 0.75rem",
				borderRadius: "0.375rem",
				margin: "0.125rem 0.5rem",
			},
		});

		menuItems.push({
			id: "import-existing-table",
			name: (
				<ODSLabel
					variant="body2"
					sx={{
						fontFamily: "Inter",
						fontSize: "13px",
						fontWeight: "400",
					}}
					color="#212121"
				>
					Import File into an existing table
				</ODSLabel>
			),
			onClick: async () => {},
			subMenu: isTableListLoading
				? [
						{
							id: "loading",
							name: (
								<Skeleton
									variant="rounded"
									width={240}
									height={30}
								/>
							),
						},
					]
				: tableListData?.map((table) => ({
						id: table?.id,
						name: (
							<ODSLabel
								variant="body2"
								sx={{
									fontFamily: "Inter",
									fontSize: "13px",
									fontWeight: "400",
								}}
								color="#212121"
							>
								{truncateName(table?.name)}
							</ODSLabel>
						),
						onClick: () => {
							const { id = "", views = [] } = table || {};

							let viewId = "";

							if (currentTableId === id) {
								viewId = currentViewId || "";
							}

							viewId = views?.[0]?.id || "";

							setSelectedTableIdWithViewId(() => ({
								tableId: id,
								viewId: viewId,
							}));
							setOpen("importTable");
						},
						sx: {
							padding: "0.5rem 0.75rem",
							borderRadius: "0.375rem",
							margin: "0.125rem 0.5rem",
						},
					})),
			leftAdornment: (
				<Icon
					outeIconName="OUTEDownloadIcon"
					outeIconProps={{
						sx: {
							color: "#90A4AE",
							width: "1rem",
							height: "1rem",
							cursor: "pointer",
						},
					}}
				/>
			),
			sx: {
				padding: "0.5rem 0.75rem",
				borderRadius: "0.375rem",
				margin: "0.125rem 0.5rem",
			},
		});

		// Divider
		menuItems.push({
			id: "divider-2",
			name: (
				<div
					style={{
						height: "1px",
						backgroundColor: "#E0E0E0",
						margin: "4px 0",
					}}
				/>
			),
			onClick: () => {},
			leftAdornment: null,
			disabled: true,
			sx: {
				cursor: "default",
				"&:hover": { backgroundColor: "transparent" },
			},
		});

		// Section 3: Add from other sources
		menuItems.push({
			id: "section-header-3",
			name: (
				<ODSLabel
					variant="body2"
					sx={{
						fontFamily: "Inter",
						fontSize: "11px",
						fontWeight: "600",
						color: "#424242",
					}}
				>
					Add from other sources
				</ODSLabel>
			),
			onClick: () => {},
			disabled: true,
			sx: {
				paddingTop: "12px",
				paddingBottom: "4px",
				cursor: "default",
				"&:hover": { backgroundColor: "transparent" },
			},
		});

		// Map importOptions to menu items
		importOptions.forEach((option) => {
			const rightAdornments = [];
			if (option.hasTeamBadge) {
				rightAdornments.push(
					<div
						key="team-badge"
						style={{
							display: "inline-flex",
							alignItems: "center",
							backgroundColor: "#1976D2",
							color: "#FFFFFF",
							padding: "2px 6px",
							borderRadius: "10px",
							fontSize: "10px",
							fontWeight: "500",
							marginLeft: "6px",
						}}
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

			menuItems.push({
				id: option.id,
				name: (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							width: "100%",
						}}
					>
						<ODSLabel
							variant="body2"
							sx={{
								fontFamily: "Inter",
								fontSize: "13px",
								fontWeight: "400",
							}}
							color="#212121"
						>
							{option.label}
						</ODSLabel>
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
					</div>
				),
				onClick: () => {
					if (
						option.id === "csv-file" ||
						option.id === "microsoft-excel"
					) {
						setSource("newTable");
						setOpen("importTable");
					} else {
						option.handler();
					}
				},
				leftAdornment: (
					<Icon
						outeIconName={option.iconName}
						outeIconProps={{
							sx: {
								color: "#90A4AE",
								width: "1rem",
								height: "1rem",
								cursor: "pointer",
							},
						}}
					/>
				),
				sx: {
					padding: "0.5rem 0.75rem",
					borderRadius: "0.375rem",
					margin: "0.125rem 0.5rem",
				},
			});
		});

		return menuItems;
	}, [
		isTableListLoading,
		tableListData,
		setOpen,
		setSource,
		setSelectedTableIdWithViewId,
		currentTableId,
		currentViewId,
	]);

	return (
		<>
			<AnchorElement onClick={onAddOrImportClick} />

			<ODSContextMenu
				coordinates={cord}
				show={!!cord}
				onClose={() => setCord(null)}
				menus={menus}
				anchorOrigin={{ vertical: "top", horizontal: "left" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
				// Note: anchorOrigin/transformOrigin are used for both parent and submenu
				// For submenu to appear on left: anchorOrigin horizontal: "left", transformOrigin horizontal: "right"
				// For parent to appear at bottom: coordinates should be set to bottom of button
				// and anchorOrigin vertical: "top" will make menu appear below the coordinates
			/>

			{open === "addTable" && (
				<AddTable
					open={"addTable"}
					setOpen={setOpen}
					baseId={baseId}
					setView={setView}
					leaveRoom={leaveRoom}
				/>
			)}

			{open === "importTable" && (
				<ImportCSV
					open={open}
					source={source}
					setOpen={setOpen}
					setSource={setSource}
					isTableListLoading={isTableListLoading}
					selectedTableIdWithViewId={selectedTableIdWithViewId}
					setView={setView}
					leaveRoom={leaveRoom}
				/>
			)}
		</>
	);
}

export default AddImport;
