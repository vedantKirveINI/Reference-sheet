import ODSContextMenu from "oute-ds-context-menu";
import ODSIcon from "oute-ds-icon";
import ODSLabel from "oute-ds-label";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

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

	const SCROLL_COMPLETE_DELAY = 350; // ms - time for smooth scroll animation

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
			// Fallback to scrollTo
			const { scrollWidth, clientWidth } = tabListRef.current;
			const scrollLeft =
				inline === "start" ? 0 : scrollWidth - clientWidth;
			tabListRef.current.scrollTo({
				left: scrollLeft,
				behavior: "smooth",
			});
		}

		// Check scroll position after animation completes
		setTimeout(() => checkScroll?.(), SCROLL_COMPLETE_DELAY);
	};

	const scrollLeftMost = () => {
		scrollToTab(0, "start");
	};

	const scrollRightMost = () => {
		setShowRightArrow(false); // Hide arrow immediately to prevent overlap
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

	const menus = useMemo(() => {
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

			// Build right adornment (chevron, Team badge, and/or Coming soon tag)
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
			let subMenu = undefined;
			if (name === "importTable" && hasSubMenu) {
				if (importOptions && importOptions.length > 0) {
					subMenu = importOptions.map((option) => {
						const subRightAdornments = [];
						if (option.hasTeamBadge) {
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
						if (option.hasComingSoon) {
							subRightAdornments.push(
								<ComingSoonTag
									key="coming-soon"
									text="Coming soon"
									variant="gray"
								/>,
							);
						}

						return {
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
											fontWeight: "400",
											fontSize: "13px",
										}}
										color="#212121"
									>
										{option?.label}
									</ODSLabel>
									{subRightAdornments.length > 0 && (
										<div
											style={{
												display: "flex",
												alignItems: "center",
												marginLeft: "8px",
												gap: "4px",
											}}
										>
											{subRightAdornments}
										</div>
									)}
								</div>
							),
							onClick: () => {
								option?.handler?.(
									setImportSource,
									setImportModalOpen,
								);
								setCord(null);
							},
							leftAdornment: (
								<ODSIcon
									outeIconName={option?.iconName}
									outeIconProps={{
										sx: {
											width: "1rem",
											height: "1rem",
											cursor: "pointer",
											color: "#90A4AE",
										},
									}}
								/>
							),
						};
					});
				} else {
					subMenu = [];
				}
			}

			const menuItem = {
				id: `menu-item-${name}-${index}`,
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
								fontWeight: "400",
								fontSize: "13px",
							}}
							color="#212121"
						>
							{label}
						</ODSLabel>
						{rightAdornments.length > 0 && (
							<div
								style={{
									display: "flex",
									alignItems: "center",
									marginLeft: "auto",
									gap: "4px",
								}}
							>
								{rightAdornments}
							</div>
						)}
					</div>
				),
				onClick: async () => {
					// For items with submenu, onClick should be empty async function (like AddImport)
					// ODSContextMenu handles submenu opening on hover (onMouseMove)
					// The submenu items have their own onClick handlers
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
				},
				leftAdornment: (
					<ODSIcon
						outeIconName={iconName}
						outeIconProps={{
							sx: {
								width: "1rem",
								height: "1rem",
								cursor: "pointer",
								color: "#90A4AE",
							},
						}}
					/>
				),
				subMenu: subMenu, // Add subMenu property - ODSContextMenu will handle rendering
				// ODSContextMenu automatically adds chevron icon on the right when subMenu?.length > 0
				// Submenu opens on hover (onMouseMove) of the entire MenuItem, including right adornment area
			};

			// Add divider after this item if needed
			if (hasDividerAfter) {
				return [
					...acc,
					menuItem,
					{
						id: `divider-${index}`,
						name: (
							<div
								style={{
									height: "1px",
									backgroundColor: "#E0E0E0",
									margin: "4px 0",
								}}
							/>
						),
						onClick: () => {}, // Divider is not clickable
						leftAdornment: null,
					},
				];
			}

			return [...acc, menuItem];
		}, []);
	}, [
		setTableContextMenu,
		tableList,
		tableId,
		setImportSource,
		setImportModalOpen,
		setCurrentTableName,
		setRenameModalOpen,
		handleHideTable,
		handleDuplicateTable,
		handleManageFields,
		handleEditDescription,
		handleEditPermissions,
		handleConfigureDependencies,
		importOptions,
	]);
	// Function to check if the leftmost and rightmost elements are visible

	// Attach scroll event listener
	useEffect(() => {
		const tabListElement = tabListRef.current;
		if (!tabListElement) return;

		// Check scroll on mount and when tableList changes
		checkScroll();

		// Also check on resize
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

	// Overflow = tabs don't fit; use 80/20 layout and put Add in fixed right strip
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

			<ODSContextMenu
				coordinates={cord}
				show={!!cord}
				onClose={() => {
					setCord(null);
				}}
				menus={menus}
				anchorOrigin={{ vertical: "top", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			/>

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
					// Update local table list after successful save
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
