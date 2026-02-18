import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ODSIcon from "@/lib/oute-icon";
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

	const contextMenuRef = useRef(null);

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

			const rightAdornments = [];
			if (hasTeamBadge) {
				rightAdornments.push(
					<div
						key="team-badge"
						className="inline-flex items-center bg-[#1976D2] text-white px-1.5 py-0.5 rounded-[10px] text-[10px] font-medium ml-1.5"
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
					subMenuItems = importOptions.map((option) => {
						const subRightAdornments = [];
						if (option.hasTeamBadge) {
							subRightAdornments.push(
								<div
									key="team-badge"
									className="inline-flex items-center bg-[#1976D2] text-white px-1.5 py-0.5 rounded-[10px] text-[10px] font-medium ml-1.5"
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
							label: option?.label,
							iconName: option?.iconName,
							rightAdornments: subRightAdornments,
							onClick: () => {
								option?.handler?.(
									setImportSource,
									setImportModalOpen,
								);
								setCord(null);
							},
						};
					});
				} else {
					subMenuItems = [];
				}
			}

			const menuItem = {
				id: `menu-item-${name}-${index}`,
				label,
				iconName,
				rightAdornments,
				subMenuItems,
				onClick: async () => {
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
				hasDividerAfter,
			};

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

			<Popover open={!!cord} onOpenChange={(v) => !v && setCord(null)}>
				<PopoverTrigger asChild>
					<span
						ref={contextMenuRef}
						style={{
							position: "fixed",
							left: cord ? `${cord.left}px` : 0,
							top: cord ? `${cord.top}px` : 0,
							width: 0,
							height: 0,
							pointerEvents: "none",
						}}
					/>
				</PopoverTrigger>
				<PopoverContent className="min-w-[200px] p-1 rounded-lg border border-gray-200 bg-white shadow-lg" align="start">
					<div className="flex flex-col">
						{menus.map((item) => (
							<div key={item.id}>
								{item.subMenuItems && item.subMenuItems.length > 0 ? (
									<Popover>
										<PopoverTrigger asChild>
											<button className="flex items-center justify-between w-full px-3 py-2 text-[13px] font-normal text-[#212121] rounded-md hover:bg-gray-100 text-left">
												<div className="flex items-center gap-2">
													<ODSIcon
														outeIconName={item.iconName}
														outeIconProps={{ size: 16, className: "text-[#90A4AE]" }}
													/>
													<span className="font-inter">{item.label}</span>
												</div>
												<div className="flex items-center gap-1">
													{item.rightAdornments}
													<ODSIcon
														outeIconName="OUTEChevronRightIcon"
														outeIconProps={{ size: 14, className: "text-[#90A4AE]" }}
													/>
												</div>
											</button>
										</PopoverTrigger>
										<PopoverContent side="right" className="min-w-[180px] p-1 rounded-lg border border-gray-200 bg-white shadow-lg" align="start">
											<div className="flex flex-col">
												{item.subMenuItems.map((subItem) => (
													<button
														key={subItem.id}
														className="flex items-center justify-between w-full px-3 py-2 text-[13px] font-normal text-[#212121] rounded-md hover:bg-gray-100 text-left"
														onClick={subItem.onClick}
													>
														<div className="flex items-center gap-2">
															<ODSIcon
																outeIconName={subItem.iconName}
																outeIconProps={{ size: 16, className: "text-[#90A4AE]" }}
															/>
															<span className="font-inter">{subItem.label}</span>
														</div>
														{subItem.rightAdornments?.length > 0 && (
															<div className="flex items-center ml-2 gap-1">
																{subItem.rightAdornments}
															</div>
														)}
													</button>
												))}
											</div>
										</PopoverContent>
									</Popover>
								) : (
									<button
										className="flex items-center justify-between w-full px-3 py-2 text-[13px] font-normal text-[#212121] rounded-md hover:bg-gray-100 text-left"
										onClick={() => {
											item.onClick();
											setCord(null);
										}}
									>
										<div className="flex items-center gap-2">
											<ODSIcon
												outeIconName={item.iconName}
												outeIconProps={{ size: 16, className: "text-[#90A4AE]" }}
											/>
											<span className="font-inter">{item.label}</span>
										</div>
										{item.rightAdornments?.length > 0 && (
											<div className="flex items-center ml-auto gap-1">
												{item.rightAdornments}
											</div>
										)}
									</button>
								)}
								{item.hasDividerAfter && (
									<div className="h-px bg-gray-200 my-1" />
								)}
							</div>
						))}
					</div>
				</PopoverContent>
			</Popover>

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
