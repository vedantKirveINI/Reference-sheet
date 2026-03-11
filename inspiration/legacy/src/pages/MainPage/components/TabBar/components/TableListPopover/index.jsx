import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSPopover from "oute-ds-popover";
import ODSTextField from "oute-ds-text-field";
import ODSTooltip from "oute-ds-tooltip";
import { useState, useRef, useEffect } from "react";

import truncateName from "../../../../../../utils/truncateName";

import styles from "./styles.module.scss";

function TableListPopover({
	tableList = [],
	activeTableId = "",
	handleTabClick = () => {},
}) {
	const [showTableList, setShowTableList] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const tableDropDownRef = useRef(null);
	const selectedTableRef = useRef(null);

	// Filter table list based on search
	const filteredTables = tableList.filter((table) =>
		table.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Scroll to selected table when popover opens
	useEffect(() => {
		if (showTableList && selectedTableRef.current) {
			selectedTableRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, [showTableList]);

	return (
		<>
			<ODSTooltip title="All Tables" placement="bottom">
				<div
					ref={tableDropDownRef}
					aria-label="TableExpand Icon"
					className={`${styles.table_list_container}`}
					onClick={() => setShowTableList(true)}
				>
					<ODSIcon
						outeIconName={"OUTEExpandMoreIcon"}
						outeIconProps={{
							sx: {
								color: "#000",
								width: "1.5rem",
								height: "1.5rem",
							},
						}}
					/>
				</div>
			</ODSTooltip>

			<ODSPopover
				open={showTableList}
				anchorEl={tableDropDownRef.current}
				onClose={() => setShowTableList(false)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
				disablePortal
				sx={{
					zIndex: 200,
				}}
				slotProps={{
					paper: {
						sx: {
							border: "0.0625rem solid #e5e7eb",
							marginTop: "0.875rem",
							borderRadius: "0.5rem",
							boxShadow:
								"0 0.25rem 0.5rem rgba(0, 0, 0, 0.1), 0 0.5rem 1.5rem rgba(0, 0, 0, 0.08), 0 1rem 3rem rgba(0, 0, 0, 0.06)",
						},
					},
				}}
			>
				<div className={styles.popover_content}>
					<div className={styles.search_container}>
						<ODSTextField
							fullWidth
							autoFocus={true}
							className="black"
							placeholder="Find a table"
							value={searchQuery}
							InputProps={{
								startAdornment: (
									<ODSIcon
										outeIconName={"OUTESearchIcon"}
										outeIconProps={{
											sx: {
												color: "#90A4AE",
												width: "1rem",
												height: "1rem",
											},
										}}
									/>
								),
							}}
							onChange={(e) => setSearchQuery(e.target.value)}
							sx={{
								"& .MuiOutlinedInput-root": {
									borderRadius: "4px",
								},
							}}
						/>
					</div>

					<div className={styles.table_list}>
						{!isEmpty(filteredTables) ? (
							filteredTables.map((table, index) => {
								const isActive = activeTableId === table.id;
								return (
									<div
										key={table.id || index}
										ref={isActive ? selectedTableRef : null}
										className={`${styles.table_item} ${
											isActive ? styles.active : ""
										}`}
										onClick={() => {
											handleTabClick({
												tableInfo: table,
											});
											setSearchQuery("");
											setShowTableList(false);
										}}
									>
										<div
											className={
												styles.checkmark_container
											}
										>
											{isActive && (
												<ODSIcon
													outeIconName={"CheckIcon"}
													outeIconProps={{
														sx: {
															color: "#263238",
															width: "1.25rem",
															height: "1.25rem",
														},
													}}
												/>
											)}
										</div>
										<span className={styles.table_name}>
											{truncateName(table?.name, 45)}
										</span>
									</div>
								);
							})
						) : (
							<div className={styles.no_tables_message}>
								No tables found
							</div>
						)}
					</div>
				</div>
			</ODSPopover>
		</>
	);
}

export default TableListPopover;
