import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icon } from "@/lib/oute-icon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import React, { useMemo, useState } from "react";

import ComingSoonTag from "../../../../components/common/ComingSoonTag";
import truncateName from "../../../../utils/truncateName";
import { importOptions } from "../TabBar/configuration/importOptions";

import AddTable from "./AddTable";
import useAddOrImport from "./hooks/useAddOrImport";
import ImportCSV from "./ImportCSV";

const AnchorElement = ({ onClick }) => {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						className="flex items-center justify-center cursor-pointer px-3 py-1.5 rounded-t-lg h-full min-h-[24px] bg-transparent text-black/[0.78] font-inter text-[0.9375rem] font-medium transition-all duration-200 hover:bg-white/50 focus-visible:outline-2 focus-visible:outline-[rgba(56,155,106,0.8)] focus-visible:outline-offset-2"
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
								className: "text-black w-5 h-5 cursor-pointer",
							}}
						/>
					</div>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>Add or Import</p>
				</TooltipContent>
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

	const [menuOpen, setMenuOpen] = useState(false);

	const handleMenuItemClick = (callback) => {
		setMenuOpen(false);
		setCord(null);
		callback();
	};

	const menus = useMemo(() => {
		const menuItems = [];

		menuItems.push({
			id: "section-header-1",
			type: "header",
			label: "Add a blank table",
		});

		menuItems.push({
			id: "start-from-scratch",
			label: "Start from scratch",
			iconName: "OUTEAddIcon",
			onClick: () => handleMenuItemClick(() => setOpen("addTable")),
		});

		menuItems.push({ id: "divider-1", type: "divider" });

		menuItems.push({
			id: "section-header-2",
			type: "header",
			label: "Import from CSV",
		});

		menuItems.push({
			id: "import-new-table",
			label: "Import File into a new table",
			iconName: "OUTEDownloadIcon",
			onClick: () =>
				handleMenuItemClick(() => {
					setOpen("importTable");
					setSource("newTable");
				}),
		});

		menuItems.push({
			id: "import-existing-table",
			label: "Import File into an existing table",
			iconName: "OUTEDownloadIcon",
			hasSubMenu: true,
			subItems: isTableListLoading
				? [{ id: "loading", label: "Loading...", disabled: true }]
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
							setMenuOpen(false);
							setCord(null);
						},
				  })),
		});

		menuItems.push({ id: "divider-2", type: "divider" });

		menuItems.push({
			id: "section-header-3",
			type: "header",
			label: "Add from other sources",
		});

		importOptions.forEach((option) => {
			const rightAdornments = [];
			if (option.hasTeamBadge) {
				rightAdornments.push(
					<div
						key="team-badge"
						className="inline-flex items-center bg-[#1976D2] text-white px-1.5 py-0.5 rounded-[10px] text-[10px] font-medium ml-1.5"
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
				label: option.label,
				iconName: option.iconName,
				rightAdornments,
				onClick: () => {
					if (
						option.id === "csv-file" ||
						option.id === "microsoft-excel"
					) {
						handleMenuItemClick(() => {
							setSource("newTable");
							setOpen("importTable");
						});
					} else {
						handleMenuItemClick(() => option.handler());
					}
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
			<Popover open={menuOpen} onOpenChange={setMenuOpen}>
				<PopoverTrigger asChild>
					<div>
						<AnchorElement
							onClick={() => {
								onAddOrImportClick();
								setMenuOpen(true);
							}}
						/>
					</div>
				</PopoverTrigger>
				<PopoverContent
					className="min-w-[260px] p-1 rounded-lg border border-gray-200 bg-white shadow-lg"
					align="start"
				>
					<div className="flex flex-col">
						{menus.map((item) => {
							if (item.type === "divider") {
								return (
									<div
										key={item.id}
										className="h-px bg-[#E0E0E0] my-1"
									/>
								);
							}
							if (item.type === "header") {
								return (
									<div
										key={item.id}
										className="px-3 pt-3 pb-1 text-[11px] font-semibold text-[#424242] font-inter"
									>
										{item.label}
									</div>
								);
							}
							if (item.hasSubMenu) {
								return (
									<Popover key={item.id}>
										<PopoverTrigger asChild>
											<button className="flex items-center justify-between w-full px-3 py-2 text-[13px] font-normal text-[#212121] rounded-md hover:bg-gray-100 text-left mx-2 cursor-pointer">
												<div className="flex items-center gap-2">
													<Icon
														outeIconName={item.iconName}
														outeIconProps={{
															className: "text-[#90A4AE] w-4 h-4",
														}}
													/>
													<span className="font-inter">
														{item.label}
													</span>
												</div>
												<Icon
													outeIconName="OUTEChevronRightIcon"
													outeIconProps={{
														className: "text-[#90A4AE] w-3.5 h-3.5",
													}}
												/>
											</button>
										</PopoverTrigger>
										<PopoverContent
											side="right"
											className="min-w-[200px] p-1 rounded-lg border border-gray-200 bg-white shadow-lg"
											align="start"
										>
											<div className="flex flex-col max-h-[300px] overflow-y-auto">
												{item.subItems?.map(
													(subItem) => (
														<button
															key={subItem.id}
															className="flex items-center w-full px-3 py-2 text-[13px] font-normal text-[#212121] rounded-md hover:bg-gray-100 text-left cursor-pointer"
															onClick={
																subItem.onClick
															}
															disabled={
																subItem.disabled
															}
														>
															<span className="font-inter">
																{subItem.label}
															</span>
														</button>
													),
												)}
											</div>
										</PopoverContent>
									</Popover>
								);
							}
							return (
								<button
									key={item.id}
									className="flex items-center justify-between w-full px-3 py-2 text-[13px] font-normal text-[#212121] rounded-md hover:bg-gray-100 text-left mx-2 cursor-pointer"
									onClick={item.onClick}
								>
									<div className="flex items-center gap-2">
										{item.iconName && (
											<Icon
												outeIconName={item.iconName}
												outeIconProps={{
													className: "text-[#90A4AE] w-4 h-4 cursor-pointer",
												}}
											/>
										)}
										<span className="font-inter">
											{item.label}
										</span>
									</div>
									{item.rightAdornments?.length > 0 && (
										<div className="flex items-center ml-2 gap-1">
											{item.rightAdornments}
										</div>
									)}
								</button>
							);
						})}
					</div>
				</PopoverContent>
			</Popover>

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
					selectedTableIdWithViewId={selectedTableIdWithViewId}
					source={source}
					setOpen={setOpen}
					setSource={setSource}
					setView={setView}
					leaveRoom={leaveRoom}
				/>
			)}
		</>
	);
}

export default AddImport;
