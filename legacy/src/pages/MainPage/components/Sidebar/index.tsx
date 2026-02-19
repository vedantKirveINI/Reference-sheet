import { useEffect } from "react";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { showAlert } from "@/lib/toast";
import { useUIStore } from "@/stores/uiStore";
import { useViewStore } from "@/stores/viewStore";
import ViewList from "../ViewList";
import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import useViews from "@/pages/MainPage/hooks/useViews";
import { ViewIcon } from "@/constants/Icons/viewIcons";
import type { IColumn } from "@/types";
import styles from "./styles.module.scss";

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
			className={`${styles.sidebar} ${sidebarExpanded ? styles.expanded : styles.collapsed}`}
		>
			<div className={styles.sidebarHeader}>
				<button
					className={styles.toggleButton}
					onClick={toggleSidebar}
					aria-label={
						sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"
					}
				>
					{sidebarExpanded ? (
						<ChevronLeft
							style={{
								width: "1.25rem",
								height: "1.25rem",
								color: "#666",
							}}
						/>
					) : (
						<ChevronRight
							style={{
								width: "1.25rem",
								height: "1.25rem",
								color: "#666",
							}}
						/>
					)}
				</button>
			</div>

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

			<div className={styles.sidebarFooter}>
				<button
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: sidebarExpanded ? "2.5rem" : "2rem",
						height: sidebarExpanded ? "2.5rem" : "2rem",
						borderRadius: "50%",
						backgroundColor: "#e0e0e0",
						border: "none",
						cursor: "pointer",
						transition: "all 0.3s ease",
					}}
					aria-label="User menu"
				>
					<User
						style={{
							width: "1.25rem",
							height: "1.25rem",
							color: "#666",
						}}
					/>
				</button>
			</div>
		</aside>
	);
}

export default Sidebar;
