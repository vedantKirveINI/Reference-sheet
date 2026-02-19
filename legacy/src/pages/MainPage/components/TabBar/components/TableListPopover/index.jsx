import isEmpty from "lodash/isEmpty";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { ChevronDown, Search, Check } from "lucide-react";
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
	const selectedTableRef = useRef(null);

	const filteredTables = tableList.filter((table) =>
		table.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	useEffect(() => {
		if (showTableList && selectedTableRef.current) {
			selectedTableRef.current?.scrollIntoView({
				behavior: "smooth",
				block: "center",
			});
		}
	}, [showTableList]);

	return (
		<Popover open={showTableList} onOpenChange={setShowTableList}>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger asChild>
						<PopoverTrigger asChild>
							<div
								aria-label="TableExpand Icon"
								className={`${styles.table_list_container}`}
							>
								<ChevronDown
									style={{
										color: "#000",
										width: "1.5rem",
										height: "1.5rem",
									}}
								/>
							</div>
						</PopoverTrigger>
					</TooltipTrigger>
					<TooltipContent side="bottom">All Tables</TooltipContent>
				</Tooltip>
			</TooltipProvider>

			<PopoverContent
				align="end"
				className="p-0"
				style={{
					border: "0.0625rem solid #e5e7eb",
					borderRadius: "0.5rem",
					boxShadow: "0 0.25rem 0.5rem rgba(0, 0, 0, 0.1), 0 0.5rem 1.5rem rgba(0, 0, 0, 0.08), 0 1rem 3rem rgba(0, 0, 0, 0.06)",
					width: "auto",
					maxWidth: "none",
				}}
			>
				<div className={styles.popover_content}>
					<div className={styles.search_container}>
						<div style={{ position: "relative" }}>
							<Search
								style={{
									position: "absolute",
									left: "8px",
									top: "50%",
									transform: "translateY(-50%)",
									color: "#90A4AE",
									width: "1rem",
									height: "1rem",
								}}
							/>
							<input
								type="text"
								autoFocus
								placeholder="Find a table"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								style={{
									width: "100%",
									padding: "8px 8px 8px 32px",
									border: "1px solid #e0e0e0",
									borderRadius: "4px",
									fontSize: "14px",
									outline: "none",
								}}
							/>
						</div>
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
												<Check
													style={{
														color: "#263238",
														width: "1.25rem",
														height: "1.25rem",
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
			</PopoverContent>
		</Popover>
	);
}

export default TableListPopover;
