import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Download, ChevronRight } from "lucide-react";
import React, { useMemo, useState } from "react";

import ComingSoonTag from "../../../../components/common/ComingSoonTag";
import truncateName from "../../../../utils/truncateName";
import { importOptions } from "../TabBar/configuration/importOptions";

import AddTable from "./AddTable";
import useAddOrImport from "./hooks/useAddOrImport";
import ImportCSV from "./ImportCSV";
import styles from "./styles.module.scss";

const AnchorElement = ({ onClick }) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
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
						<Plus
							style={{
								color: "#000",
								width: "1.25rem",
								height: "1.25rem",
								cursor: "pointer",
							}}
						/>
					</div>
				</TooltipTrigger>
				<TooltipContent side="bottom">Add or Import</TooltipContent>
			</Tooltip>
		</TooltipProvider>
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

	const [hoveredSubmenu, setHoveredSubmenu] = useState(null);

	const menuSections = useMemo(() => {
		return [
			{
				id: "section-1",
				header: "Add a blank table",
				items: [
					{
						id: "start-from-scratch",
						label: "Start from scratch",
						icon: <Plus style={{ color: "#90A4AE", width: "1rem", height: "1rem" }} />,
						onClick: () => {
							setOpen("addTable");
							setCord(null);
						},
					},
				],
			},
			{
				id: "section-2",
				header: "Import from CSV",
				items: [
					{
						id: "import-new-table",
						label: "Import File into a new table",
						icon: <Download style={{ color: "#90A4AE", width: "1rem", height: "1rem" }} />,
						onClick: () => {
							setOpen("importTable");
							setSource("newTable");
							setCord(null);
						},
					},
					{
						id: "import-existing-table",
						label: "Import File into an existing table",
						icon: <Download style={{ color: "#90A4AE", width: "1rem", height: "1rem" }} />,
						hasSubMenu: true,
						subMenuItems: isTableListLoading
							? [{ id: "loading", label: "Loading...", isLoading: true }]
							: tableListData?.map((table) => ({
									id: table?.id,
									label: truncateName(table?.name),
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
										setCord(null);
									},
								})),
					},
				],
			},
			{
				id: "section-3",
				header: "Add from other sources",
				items: importOptions.map((option) => {
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
					return {
						id: option.id,
						label: option.label,
						rightAdornments,
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
							setCord(null);
						},
					};
				}),
			},
		];
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

			{!!cord && (
				<>
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							zIndex: 999,
						}}
						onClick={() => {
							setCord(null);
							setHoveredSubmenu(null);
						}}
					/>
					<div
						style={{
							position: "fixed",
							top: cord.top,
							left: cord.left,
							zIndex: 1000,
							minWidth: "280px",
							borderRadius: "8px",
							border: "1px solid #e5e7eb",
							boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
							padding: "4px 0",
							backgroundColor: "#fff",
						}}
					>
						{menuSections.map((section, sIdx) => (
							<React.Fragment key={section.id}>
								{sIdx > 0 && (
									<div style={{ height: "1px", backgroundColor: "#E0E0E0", margin: "4px 0" }} />
								)}
								<div
									style={{
										padding: "12px 12px 4px",
										fontSize: "11px",
										fontWeight: "600",
										color: "#424242",
										fontFamily: "Inter, sans-serif",
									}}
								>
									{section.header}
								</div>
								{section.items.map((item) => (
									<div
										key={item.id}
										style={{
											position: "relative",
											padding: "8px 12px",
											margin: "2px 8px",
											borderRadius: "6px",
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											cursor: "pointer",
											fontSize: "13px",
											fontFamily: "Inter, sans-serif",
											color: "#212121",
										}}
										onClick={() => {
											if (!item.hasSubMenu) {
												item.onClick?.();
											}
										}}
										onMouseEnter={() => {
											if (item.hasSubMenu) setHoveredSubmenu(item.id);
											else setHoveredSubmenu(null);
										}}
										onMouseOver={(e) => {
											e.currentTarget.style.backgroundColor = "#f5f5f5";
										}}
										onMouseOut={(e) => {
											e.currentTarget.style.backgroundColor = "transparent";
										}}
									>
										<div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
											{item.icon && <span>{item.icon}</span>}
											<span>{item.label}</span>
										</div>
										{item.rightAdornments && item.rightAdornments.length > 0 && (
											<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
												{item.rightAdornments}
											</div>
										)}
										{item.hasSubMenu && (
											<ChevronRight style={{ width: "14px", height: "14px", color: "#90A4AE" }} />
										)}

										{item.hasSubMenu && hoveredSubmenu === item.id && item.subMenuItems && (
											<div
												style={{
													position: "absolute",
													top: 0,
													left: "100%",
													minWidth: "240px",
													maxHeight: "300px",
													overflowY: "auto",
													borderRadius: "8px",
													border: "1px solid #e5e7eb",
													boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
													padding: "4px 0",
													backgroundColor: "#fff",
													zIndex: 1001,
												}}
											>
												{item.subMenuItems.map((subItem) =>
													subItem.isLoading ? (
														<div key={subItem.id} style={{ padding: "8px 12px" }}>
															<Skeleton className="h-[30px] w-[240px] rounded" />
														</div>
													) : (
														<div
															key={subItem.id}
															onClick={(e) => {
																e.stopPropagation();
																subItem.onClick?.();
															}}
															style={{
																padding: "8px 12px",
																margin: "2px 8px",
																borderRadius: "6px",
																cursor: "pointer",
																fontSize: "13px",
																fontFamily: "Inter, sans-serif",
																color: "#212121",
															}}
															onMouseOver={(e) => {
																e.currentTarget.style.backgroundColor = "#f5f5f5";
															}}
															onMouseOut={(e) => {
																e.currentTarget.style.backgroundColor = "transparent";
															}}
														>
															{subItem.label}
														</div>
													),
												)}
											</div>
										)}
									</div>
								))}
							</React.Fragment>
						))}
					</div>
				</>
			)}

			{open === "addTable" && (
				<AddTable
					open={open}
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
					selectedTableIdWithViewId={selectedTableIdWithViewId}
					setView={setView}
					leaveRoom={leaveRoom}
				/>
			)}
		</>
	);
}

export default AddImport;
