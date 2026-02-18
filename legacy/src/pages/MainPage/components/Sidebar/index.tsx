import { useEffect } from "react";
import ODSCommonAccountAction from "@oute/icdeployment.molecule.common-account-actions";
import ODSIcon from "@/lib/oute-icon";
import { useUIStore } from "@/stores/uiStore";
import { useViewStore } from "@/stores/viewStore";
import ViewList from "../ViewList";
import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import useViews from "@/pages/MainPage/hooks/useViews";
import { ViewIcon } from "@/constants/Icons/viewIcons";
import type { IColumn } from "@/types";
import { showAlert } from "@/lib/toast";

interface SidebarProps {
	columns?: IColumn[];
}

function Sidebar({ columns = [] }: SidebarProps) {
	const { sidebarExpanded, toggleSidebar, setCurrentView: setUIView } = useUIStore();
	const { views, currentViewId, setCurrentView, setViews } = useViewStore();
	const { tableId, assetId: baseId } = useDecodedUrlParams();
	const { fetchViews, loading: isLoadingViews } = useViews();

	useEffect(() => {
		if (tableId && baseId) {
			const hasViewsForTable = views.some((v) => v.tableId === tableId);
			
			if (!hasViewsForTable) {
				fetchViews({ baseId, tableId, is_field_required: true })
					.then((fetchedViews) => {
						if (fetchedViews && fetchedViews.length > 0) {
							const tableViews = fetchedViews.filter(
								(v) => v.tableId === tableId,
							);
							setViews(tableViews);
						}
					})
					.catch(() => {
						showAlert({
							type: "error",
							message: "Failed to fetch views",
						});
					});
			}
		}
	}, [tableId, baseId]);

	const tableViews = views.filter((v) => v.tableId === tableId);

	const handleViewClick = (viewId: string, viewType: string) => {
		setCurrentView(viewId);
		const normalizedType = viewType === "kanban" ? "kanban" : "grid";
		setUIView(normalizedType);
	};

	return (
		<aside
			className={`flex flex-col bg-white border-r border-[#e0e0e0] transition-[width] duration-300 ease-in-out shadow-[2px_0_8px_rgba(0,0,0,0.05)] ${sidebarExpanded ? "w-[240px]" : "w-[60px]"} max-md:fixed max-md:top-0 max-md:left-0 max-md:h-screen max-md:z-[1000] ${!sidebarExpanded ? "max-md:!w-0 max-md:border-r-0" : ""}`}
		>
			<div className="flex items-center justify-end p-4 border-b border-[#e0e0e0] h-16 max-[1599px]:h-14 box-border">
				<button
					className="bg-none border-none cursor-pointer px-2 py-1 rounded transition-all duration-200 flex-shrink-0 flex items-center justify-center hover:bg-[#f5f5f5]"
					onClick={toggleSidebar}
					aria-label={
						sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
					}
				>
					{sidebarExpanded ? (
						<ODSIcon
							outeIconName="OUTEChevronLeftIcon"
							outeIconProps={{
								size: 20,
								className: "text-[#666]",
							}}
						/>
					) : (
						<ODSIcon
							outeIconName="OUTEChevronRightIcon"
							outeIconProps={{
								size: 20,
								className: "text-[#666]",
							}}
						/>
					)}
				</button>
			</div>

			{sidebarExpanded && (
				<div className="p-4 overflow-y-auto overflow-x-visible flex-1 min-h-0">
					<h3 className="text-xs font-semibold text-[#666] uppercase tracking-[0.5px] m-0 mb-3 px-1">Views</h3>
					{tableId ? (
						<ViewList tableId={tableId} columns={columns} />
					) : (
						<div className="flex items-center justify-center p-4 w-full">
							<div className="w-6 h-6 border-[3px] border-[#e0e0e0] border-t-[#1a73e8] rounded-full animate-spin flex-shrink-0 aspect-square"></div>
						</div>
					)}
				</div>
			)}

			{!sidebarExpanded && tableId && (
				<div className="flex flex-col gap-2 py-4 px-2 items-center flex-1 overflow-y-auto min-h-0">
					{isLoadingViews || tableViews.length === 0 ? (
						<div className="flex items-center justify-center p-4 w-full">
							<div className="w-6 h-6 border-[3px] border-[#e0e0e0] border-t-[#1a73e8] rounded-full animate-spin flex-shrink-0 aspect-square"></div>
						</div>
					) : (
						tableViews.map((view) => (
							<button
								key={view.id}
								className={`w-11 h-11 border-none bg-none rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center text-[#666] flex-shrink-0 hover:bg-[#f5f5f5] ${
									view.id === currentViewId ? "!bg-[#e3f2fd] !text-[#1a73e8]" : ""
								}`}
								onClick={() => handleViewClick(view.id, view.type)}
								aria-label={view.name}
								title={view.name}
							>
								<ViewIcon
									type={view.type}
									size={20}
									className="text-lg leading-none"
								/>
							</button>
						))
					)}
				</div>
			)}

			<div className={`p-4 border-t border-[#e0e0e0] flex items-center justify-center flex-shrink-0 bg-[#fafafa] transition-all duration-300 mt-auto ${!sidebarExpanded ? "!p-3" : ""}`}>
				<ODSCommonAccountAction
					avatarProps={{
						className: `transition-all duration-300 ease-in-out ${sidebarExpanded ? "w-10 h-10" : "w-8 h-8"}`,
					}}
				/>
			</div>
		</aside>
	);
}

export default Sidebar;
