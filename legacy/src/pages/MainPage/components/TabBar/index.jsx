import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChevronRight } from "lucide-react";

import ComingSoonTag from "../../../../components/common/ComingSoonTag";
import { SheetsContext } from "../../../../context/SheetsContext";
import useDecodedUrlParams from "../../../../hooks/useDecodedUrlParams";
import useExportData from "../../hooks/useExportData";
import getAssetAccessDetails from "../../utils/getAssetAccessDetails";
import ImportCSV from "../AddImport/ImportCSV";

import PrivateViewTabBar from "./components/PrivateViewTabBar";
import PublicViewTabBar from "./components/PublicViewTabBar";
import RenameTableModal from "./components/RenameTableModal";
import WarningModal from "./components/WarningModal";
import { tableSetting } from "./configuration/tableSetting";
import { importOptions } from "./configuration/importOptions";
import useTabBar from "./hook/useTabBar";

function TabBar({
	tableList = [],
	handleTabClick = () => {},
	setView = () => {},
	leaveRoom = () => {},
	setTableList = () => {},
}) {
	const { assetAccessDetails, isMobile } = useContext(SheetsContext);
	const { isViewOnly } = getAssetAccessDetails(assetAccessDetails);

	const [cord, setCord] = useState(null);
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(false);

	const tabListRef = useRef();
	const activeTabRef = useRef(null);

	const { tableId, viewId, assetId } = useDecodedUrlParams();

	const {
		onSubmit,
		loading,
		tableContextMenu,
		setTableContextMenu,
		renameTable,
		renameLoading,
		checkScroll,
	} = useTabBar({
		tableList,
		handleTabClick,
		setShowLeftArrow,
		setShowRightArrow,
		tabListRef,
	});

	const { onClick: handleExportCSV } = useExportData({
		viewId,
		tableId,
		baseId: assetId,
		tableListData: tableList,
	});

	const [renameModalOpen, setRenameModalOpen] = useState(false);
	const [currentTableName, setCurrentTableName] = useState("");
	const [renameModalPosition, setRenameModalPosition] = useState(null);
	const [importModalOpen, setImportModalOpen] = useState(false);
	const [importSource, setImportSource] = useState("");
	const [hoveredSubmenu, setHoveredSubmenu] = useState(null);

	const SCROLL_COMPLETE_DELAY = 350;

	const scrollToTab = (index, inline = "center") => {
		if (!tabListRef.current || !tableList.length) return;

		const tabElement = tabListRef.current.querySelector(
			`[data-testid="table-name-container-${index}"]`,
		);

		if (tabElement) {
			tabElement.scrollIntoView({
				behavior: "smooth",
				block: "nearest",
				inline,
			});
		} else {
			const { scrollWidth, clientWidth } = tabListRef.current;
			const scrollLeft =
				inline === "start" ? 0 : scrollWidth - clientWidth;
			tabListRef.current.scrollTo({
				left: scrollLeft,
				behavior: "smooth",
			});
		}

		setTimeout(() => checkScroll?.(), SCROLL_COMPLETE_DELAY);
	};

	const scrollLeftMost = () => {
		scrollToTab(0, "start");
	};

	const scrollRightMost = () => {
		setShowRightArrow(false);
		scrollToTab(tableList.length - 1, "end");
	};

	const handleHideTable = () => {
		setCord(null);
	};

	const handleDuplicateTable = () => {
		setCord(null);
	};

	const handleManageFields = () => {
		setCord(null);
	};

	const handleEditDescription = () => {
		setCord(null);
	};

	const handleEditPermissions = () => {
		setCord(null);
	};

	const handleConfigureDependencies = () => {
		setCord(null);
	};

	const handleMenuItemClick = (name, hasSubMenu) => {
		if (hasSubMenu) {
			return;
		}

		if (name === "renameTable") {
			const currentTable = tableList.find(
				(t) => t.id === tableId,
			);
			setCurrentTableName(currentTable?.name || "");
			if (cord) {
				const renameDialogWidth = 420;
				setRenameModalPosition({
					top: cord.top,
					left: Math.max(
						8,
						cord.left - renameDialogWidth,
					),
				});
			}
			setCord(null);
			setRenameModalOpen(true);
		} else if (name === "hideTable") {
			handleHideTable();
		} else if (name === "duplicateTable") {
			handleDuplicateTable();
		} else if (name === "manageFields") {
			handleManageFields();
		} else if (name === "editTableDescription") {
			handleEditDescription();
		} else if (name === "editTablePermissions") {
			handleEditPermissions();
		} else if (name === "configureDateDependencies") {
			handleConfigureDependencies();
		} else if (name === "exportAsCSV") {
			handleExportCSV();
		} else {
			setTableContextMenu(name);
		}
		setCord(null);
	};

	const menuItems = useMemo(() => {
		return tableSetting.reduce((acc, config, index) => {
			const {
				name,
				label,
				iconName,
				hasSubMenu,
				hasTeamBadge,
				hasDividerAfter,
				hasComingSoon,
			} = config;

			if (tableList.length === 1 && name === "deleteTable") {
				return acc;
			}

			const rightAdornments = [];
			if (hasTeamBadge) {
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
			if (hasComingSoon) {
				rightAdornments.push(
					<ComingSoonTag
						key="coming-soon"
						text="Coming soon"
						variant="gray"
					/>,
				);
			}

			let subMenuItems = undefined;
			if (name === "importTable" && hasSubMenu) {
				if (importOptions && importOptions.length > 0) {
					subMenuItems = importOptions.map((option) => ({
						...option,
						onClick: () => {
							option?.handler?.(setImportSource, setImportModalOpen);
							setCord(null);
						},
					}));
				}
			}

			const menuItem = {
				name,
				label,
				iconName,
				hasSubMenu,
				hasDividerAfter,
				rightAdornments,
				subMenuItems,
			};

			return [...acc, menuItem];
		}, []);
	}, [
		tableList,
		tableId,
		setImportSource,
		setImportModalOpen,
		importOptions,
	]);

	useEffect(() => {
		const tabListElement = tabListRef.current;
		if (!tabListElement) return;

		checkScroll();

		const handleResize = () => {
			checkScroll();
		};

		window.addEventListener("resize", handleResize);
		tabListElement.addEventListener("scroll", checkScroll);

		return () => {
			tabListElement.removeEventListener("scroll", checkScroll);
			window.removeEventListener("resize", handleResize);
		};
	}, [tableList, checkScroll]);

	const hasOverflow = showLeftArrow || showRightArrow;

	const commonProps = {
		tableList,
		handleTabClick,
		scrollLeftMost,
		scrollRightMost,
		showLeftArrow,
		showRightArrow,
		tabListRef,
		activeTabRef,
		tableId,
		viewId,
		assetId,
		setCord,
		setTableList,
		hasOverflow,
	};

	return (
		<>
			{isViewOnly ? (
				<PublicViewTabBar {...commonProps} />
			) : (
				<PrivateViewTabBar
					{...commonProps}
					setView={setView}
					leaveRoom={leaveRoom}
					isMobile={isMobile}
				/>
			)}

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
							minWidth: "220px",
							borderRadius: "8px",
							border: "1px solid #e5e7eb",
							boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
							padding: "4px 0",
							backgroundColor: "#fff",
						}}
					>
						{menuItems.map((item, idx) => (
							<div key={`${item.name}-${idx}`}>
								<div
									onClick={() => handleMenuItemClick(item.name, item.hasSubMenu)}
									onMouseEnter={() => {
										if (item.hasSubMenu) {
											setHoveredSubmenu(item.name);
										} else {
											setHoveredSubmenu(null);
										}
									}}
									style={{
										padding: "8px 16px",
										minHeight: "36px",
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										cursor: "pointer",
										position: "relative",
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
									<div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
										<span style={{ width: "16px", height: "16px", color: "#90A4AE", display: "inline-flex", alignItems: "center", justifyContent: "center" }} />
										<span>{item.label}</span>
									</div>
									<div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
										{item.rightAdornments}
										{item.hasSubMenu && (
											<ChevronRight style={{ width: "14px", height: "14px", color: "#90A4AE" }} />
										)}
									</div>

									{item.hasSubMenu && hoveredSubmenu === item.name && item.subMenuItems && (
										<div
											style={{
												position: "absolute",
												top: 0,
												left: "100%",
												minWidth: "200px",
												borderRadius: "8px",
												border: "1px solid #e5e7eb",
												boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
												padding: "4px 0",
												backgroundColor: "#fff",
												zIndex: 1001,
											}}
										>
											{item.subMenuItems.map((subItem) => {
												const subRightAdornments = [];
												if (subItem.hasTeamBadge) {
													subRightAdornments.push(
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
												if (subItem.hasComingSoon) {
													subRightAdornments.push(
														<ComingSoonTag
															key="coming-soon"
															text="Coming soon"
															variant="gray"
														/>,
													);
												}
												return (
													<div
														key={subItem.id}
														onClick={(e) => {
															e.stopPropagation();
															subItem.onClick();
														}}
														style={{
															padding: "8px 16px",
															minHeight: "36px",
															display: "flex",
															alignItems: "center",
															justifyContent: "space-between",
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
														<span>{subItem.label}</span>
														{subRightAdornments.length > 0 && (
															<div style={{ display: "flex", alignItems: "center", marginLeft: "8px", gap: "4px" }}>
																{subRightAdornments}
															</div>
														)}
													</div>
												);
											})}
										</div>
									)}
								</div>
								{item.hasDividerAfter && (
									<div
										style={{
											height: "1px",
											backgroundColor: "#E0E0E0",
											margin: "4px 0",
										}}
									/>
								)}
							</div>
						))}
					</div>
				</>
			)}

			{importModalOpen && (
				<ImportCSV
					open={"importTable"}
					source={importSource}
					setOpen={(value) => {
						setImportModalOpen(value === "importTable");
						if (!value) {
							setImportSource("");
						}
					}}
					setSource={setImportSource}
					selectedTableIdWithViewId={{ tableId, viewId }}
					setView={setView}
					leaveRoom={leaveRoom}
				/>
			)}

			<RenameTableModal
				open={renameModalOpen}
				onClose={() => {
					setRenameModalOpen(false);
					setCurrentTableName("");
					setRenameModalPosition(null);
				}}
				tableName={currentTableName}
				position={renameModalPosition}
				baseId={assetId}
				tableId={tableId}
				onSave={({ name }) => {
					const updatedTableList = tableList.map((table) =>
						table.id === tableId ? { ...table, name } : table,
					);
					setTableList(updatedTableList);
					setRenameModalOpen(false);
					setCurrentTableName("");
					setRenameModalPosition(null);
				}}
			/>

			<WarningModal
				open={tableContextMenu}
				setOpen={setTableContextMenu}
				loading={loading}
				onSubmit={onSubmit}
			/>
		</>
	);
}

export default TabBar;
