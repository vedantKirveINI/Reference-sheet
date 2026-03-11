// Inspired by Teable's sidebar navigation
import { useEffect } from "react";
import ODSCommonAccountAction from "@oute/icdeployment.molecule.common-account-actions";
import ODSIcon from "oute-ds-icon";
import { useUIStore } from "@/stores/uiStore";
import { useViewStore } from "@/stores/viewStore";
import ViewList from "../ViewList";
import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import useViews from "@/pages/MainPage/hooks/useViews";
import { ViewIcon } from "@/constants/Icons/viewIcons";
import type { IColumn } from "@/types";
import styles from "./styles.module.scss";
import { showAlert } from "oute-ds-alert";

interface SidebarProps {
	columns?: IColumn[];
}

function Sidebar({ columns = [] }: SidebarProps) {
	// Get ALL state from Zustand store - fully self-contained
	const { sidebarExpanded, toggleSidebar, setCurrentView: setUIView } = useUIStore();
	const { views, currentViewId, setCurrentView, setViews } = useViewStore();
	const { tableId, assetId: baseId } = useDecodedUrlParams();
	const { fetchViews, loading: isLoadingViews } = useViews();

	// Fetch views when tableId/baseId are available (even when collapsed)
	useEffect(() => {
		if (tableId && baseId) {
			// Check if we already have views for this table
			const hasViewsForTable = views.some((v) => v.tableId === tableId);
			
			// Only fetch if we don't have views yet
			if (!hasViewsForTable) {
				fetchViews({ baseId, tableId, is_field_required: true })
					.then((fetchedViews) => {
						if (fetchedViews && fetchedViews.length > 0) {
							// Filter views to only show views for current table
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

	// Filter views for current table
	const tableViews = views.filter((v) => v.tableId === tableId);

	// Handle view click in collapsed state
	const handleViewClick = (viewId: string, viewType: string) => {
		setCurrentView(viewId);
		// Normalize view type
		const normalizedType = viewType === "kanban" ? "kanban" : "grid";
		setUIView(normalizedType);
	};

	return (
		<aside
			className={`${styles.sidebar} ${sidebarExpanded ? styles.expanded : styles.collapsed}`}
		>
			{/* Sidebar Header - Always visible */}
			<div className={styles.sidebarHeader}>
				<button
					className={styles.toggleButton}
					onClick={toggleSidebar}
					aria-label={
						sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
					}
				>
					{sidebarExpanded ? (
						<ODSIcon
							outeIconName="OUTEChevronLeftIcon"
							outeIconProps={{
								sx: {
									width: "1.25rem",
									height: "1.25rem",
									color: "#666",
								},
							}}
						/>
					) : (
						<ODSIcon
							outeIconName="OUTEChevronRightIcon"
							outeIconProps={{
								sx: {
									width: "1.25rem",
									height: "1.25rem",
									color: "#666",
								},
							}}
						/>
					)}
				</button>
			</div>

			{/* View Section - Only shown when expanded */}
			{sidebarExpanded && (
				<div className={styles.viewSection}>
					<h3 className={styles.sectionTitle}>Views</h3>
					{tableId ? (
						<ViewList tableId={tableId} columns={columns} />
					) : (
						<div className={styles.loadingContainer}>
							<div className={styles.circularLoader}></div>
						</div>
					)}
				</div>
			)}

			{/* Collapsed View Icons - Only shown when collapsed */}
			{!sidebarExpanded && tableId && (
				<div className={styles.collapsedViewList}>
					{isLoadingViews || tableViews.length === 0 ? (
						<div className={styles.loadingContainer}>
							<div className={styles.circularLoader}></div>
						</div>
					) : (
						tableViews.map((view) => (
							<button
								key={view.id}
								className={`${styles.collapsedViewIcon} ${
									view.id === currentViewId ? styles.active : ""
								}`}
								onClick={() => handleViewClick(view.id, view.type)}
								aria-label={view.name}
								title={view.name}
							>
								<ViewIcon
									type={view.type}
									size={20}
									className={styles.viewIcon}
								/>
							</button>
						))
					)}
				</div>
			)}

			{/* Sidebar Footer - Profile Section */}
			<div className={styles.sidebarFooter}>
				<ODSCommonAccountAction
					avatarProps={{
						sx: {
							width: sidebarExpanded ? "2.5rem" : "2rem",
							height: sidebarExpanded ? "2.5rem" : "2rem",
							transition: "all 0.3s ease",
						},
					}}
				/>
			</div>
		</aside>
	);
}

export default Sidebar;
