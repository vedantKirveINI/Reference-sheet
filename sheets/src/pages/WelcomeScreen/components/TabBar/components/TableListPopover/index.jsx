import isEmpty from "lodash/isEmpty";
import ODSIcon from "oute-ds-icon";
import ODSPopover from "oute-ds-popover";
import ODSTextField from "oute-ds-text-field";
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
			<div
				ref={tableDropDownRef}
				aria-label="TableExpand Icon"
				className={`${styles.table_list_container} ${showTableList && styles.active}`}
				onClick={() => setShowTableList(true)}
			>
				<ODSIcon
					outeIconName={"OUTEExpandMoreIcon"}
					outeIconProps={{
						sx: {
							color: showTableList ? "#000" : "#fff",
							width: "1.5rem",
							height: "1.5rem",
						},
					}}
				/>
			</div>

			<ODSPopover
				open={showTableList}
				anchorEl={tableDropDownRef.current}
				onClose={() => setShowTableList(false)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
				disablePortal
				sx={{
					".MuiPaper-root": {
						border: "0.047rem solid #CFD8DC",
						marginTop: "0.35rem",
					},
				}}
			>
				<div className={styles.popover_content}>
					<ODSTextField
						fullWidth
						autoFocus={true}
						className="black"
						placeholder="Find your table"
						value={searchQuery}
						InputProps={{
							startAdornment: (
								<ODSIcon outeIconName={"OUTESearchIcon"} />
							),
						}}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>

					<div className={styles.table_list}>
						{!isEmpty(filteredTables) ? (
							filteredTables.map((table, index) => (
								<div
									key={table.id || index}
									ref={
										activeTableId === table.id
											? selectedTableRef
											: null
									}
									className={`${styles.table_item} ${
										activeTableId === table.id
											? styles.active
											: ""
									}`}
									onClick={() => {
										handleTabClick({ tableInfo: table });
										setSearchQuery("");
										setShowTableList(false);
									}}
								>
									{truncateName(table?.name, 45)}
								</div>
							))
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
