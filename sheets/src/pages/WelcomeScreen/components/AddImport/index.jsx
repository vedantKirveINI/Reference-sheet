import ODSContextMenu from "oute-ds-context-menu";
import Icon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import Skeleton from "oute-ds-skeleton";
import React, { useMemo } from "react";

import truncateName from "../../../../utils/truncateName";

import AddTable from "./AddTable";
import useAddOrImport from "./hooks/useAddOrImport";
import ImportCSV from "./ImportCSV";
import styles from "./styles.module.scss";

const AnchorElement = ({ onClick }) => {
	return (
		<div
			className={styles.add_import_container}
			role="presentation"
			onClick={onClick}
		>
			<Icon
				outeIconName="OUTEAddIcon"
				outeIconProps={{
					sx: {
						color: "#fff",
						width: "1.25rem",
						height: "1.25rem",
						cursor: "pointer",
					},
				}}
			/>
			<ODSLabel
				variant="subtitle2"
				sx={{ fontFamily: "Inter", fontWeight: "400" }}
				color="#fff"
			>
				ADD OR IMPORT
			</ODSLabel>
		</div>
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

	// Use useMemo to prevent unnecessary recalculations of menus
	const menus = useMemo(
		() => [
			{
				id: "12",
				name: (
					<ODSLabel
						variant="subtitle1"
						sx={{ fontFamily: "Inter", fontWeight: "400" }}
						color="#263238"
					>
						Add Table
					</ODSLabel>
				),
				onClick: () => {
					setOpen("addTable"); // Toggle the dialog open state
				},
				leftAdornment: (
					<Icon
						outeIconName="OUTEAddIcon"
						outeIconProps={{
							sx: {
								color: "red",
								width: "1.125rem",
								height: "1.125rem",
								cursor: "pointer",
							},
						}}
					/>
				),
			},
			{
				id: "1234",
				name: (
					<ODSLabel
						variant="subtitle1"
						sx={{ fontFamily: "Inter", fontWeight: "400" }}
						color="#263238"
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
								color: "red",
								width: "1.125rem",
								height: "1.125rem",
								cursor: "pointer",
							},
						}}
					/>
				),
			},
			{
				id: "123456",
				name: (
					<ODSLabel
						variant="subtitle1"
						sx={{ fontFamily: "Inter", fontWeight: "400" }}
						color="#263238"
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
									variant="subtitle1"
									sx={{
										fontFamily: "Inter",
										fontWeight: "400",
									}}
									color="#263238"
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
						})),
				leftAdornment: (
					<Icon
						outeIconName="OUTEDownloadIcon"
						outeIconProps={{
							sx: {
								color: "red",
								width: "1.125rem",
								height: "1.125rem",
								cursor: "pointer",
							},
						}}
					/>
				),
			},
		],
		[
			isTableListLoading,
			tableListData,
			setOpen,
			setSource,
			setSelectedTableIdWithViewId,
		],
	);

	return (
		<div className={styles.container}>
			<AnchorElement onClick={onAddOrImportClick} />

			<ODSContextMenu
				coordinates={cord}
				show={!!cord}
				onClose={() => setCord(null)}
				menus={menus}
				anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
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
		</div>
	);
}

export default AddImport;
