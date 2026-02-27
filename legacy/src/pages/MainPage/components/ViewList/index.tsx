import React, { useState, useMemo, useCallback } from "react";
import { Plus } from "lucide-react";
import { useViewStore } from "@/stores/viewStore";
import { useUIStore } from "@/stores/uiStore";
import useDeleteView from "@/pages/MainPage/hooks/useDeleteView";
import useRenameView from "@/pages/MainPage/hooks/useRenameView";
import useDecodedUrlParams from "@/hooks/useDecodedUrlParams";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import ViewSearch from "./ViewSearch";
import ViewListItem from "./ViewListItem";
import ViewContextMenu from "./ViewContextMenu";
import CreateViewModal from "../CreateViewModal";
import type { IView } from "@/types/view";
import styles from "./styles.module.scss";

/**
 * Normalize view type - default to "grid" if type is unknown
 * @param viewType - The view type from the view object
 * @returns "grid" | "kanban" - normalized view type
 */
const normalizeViewType = (viewType: string): "grid" | "kanban" => {
	if (viewType === "kanban") return "kanban";
	// default_grid and grid both show grid UI
	if (viewType === "default_grid" || viewType === "grid") return "grid";
	return "grid";
};

interface ViewListProps {
	tableId: string;
	columns?: any[];
}

function ViewList({ tableId, columns = [] }: ViewListProps) {
	const {
		views,
		currentViewId,
		setCurrentView,
		removeView,
		preventLastViewDeletion,
	} = useViewStore();
	const { assetId: baseId } = useDecodedUrlParams();
	const { deleteView: deleteViewAPI } = useDeleteView();
	const { setCurrentView: setUIView } = useUIStore();

	const [searchQuery, setSearchQuery] = useState("");
	const [createModalOpen, setCreateModalOpen] = useState(false);
	const [contextMenuAnchor, setContextMenuAnchor] =
		useState<HTMLElement | null>(null);
	const [contextMenuView, setContextMenuView] = useState<IView | null>(null);
	const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
	const [viewToDelete, setViewToDelete] = useState<IView | null>(null);
	const [renamingViewId, setRenamingViewId] = useState<string | null>(null);
	const { renameView } = useRenameView();

	// Filter views for current table (views are fetched by Sidebar component)
	const tableViews = useMemo(() => {
		return views.filter((view) => view.tableId === tableId);
	}, [views, tableId]);

	// Filter views based on search query
	const filteredViews = useMemo(() => {
		if (!searchQuery.trim()) {
			return tableViews;
		}
		const query = searchQuery.toLowerCase();
		return tableViews.filter((view) =>
			view.name.toLowerCase().includes(query),
		);
	}, [tableViews, searchQuery]);

	const handleSearch = useCallback((query: string) => {
		setSearchQuery(query);
	}, []);

	const handleViewClick = useCallback(
		(view: IView) => {
			setCurrentView(view.id);
			// Update UI store's currentView based on view type (default to "grid" if unknown)
			const normalizedType = normalizeViewType(view.type);
			setUIView(normalizedType);
		},
		[setCurrentView, setUIView],
	);

	const handleMenuClick = useCallback(
		(event: React.MouseEvent, view: IView) => {
			event.preventDefault();
			setContextMenuAnchor(event.currentTarget as HTMLElement);
			setContextMenuView(view);
		},
		[],
	);

	const handleCloseContextMenu = useCallback(() => {
		setContextMenuAnchor(null);
		setContextMenuView(null);
	}, []);

	const handleStartRename = useCallback(
		(view: IView) => {
			handleCloseContextMenu();
			setRenamingViewId(view.id);
		},
		[handleCloseContextMenu],
	);

	const handleInlineRename = useCallback(
		async (viewId: string, newName: string): Promise<boolean> => {
			if (!tableId || !baseId) {
				return false;
			}

			try {
				const updatedView = await renameView({
					id: viewId,
					name: newName,
					tableId,
					baseId,
				});

				if (updatedView) {
					const { updateView } = useViewStore.getState();
					updateView(viewId, updatedView);
					setRenamingViewId(null);
					return true;
				}
				return false;
			} catch (error) {
				// Error already handled in renameView hook
				return false;
			}
		},
		[renameView, tableId, baseId],
	);

	const handleDeleteClick = useCallback(
		(view: IView) => {
			if (preventLastViewDeletion()) {
				// Error will be shown by store
				handleCloseContextMenu();
				return;
			}
			setViewToDelete(view);
			setDeleteConfirmOpen(true);
			handleCloseContextMenu();
		},
		[handleCloseContextMenu, preventLastViewDeletion],
	);

	const handleDeleteConfirm = useCallback(async () => {
		if (!viewToDelete || !tableId || !baseId) return;

		const success = await deleteViewAPI({
			viewId: viewToDelete.id,
			tableId,
			baseId,
		});
		if (success) {
			removeView(viewToDelete.id);
		}
		setDeleteConfirmOpen(false);
		setViewToDelete(null);
	}, [viewToDelete, deleteViewAPI, removeView, tableId, baseId]);

	const handleDeleteCancel = useCallback(() => {
		setDeleteConfirmOpen(false);
		setViewToDelete(null);
	}, []);

	const canDelete = useMemo(() => {
		return tableViews.length > 1;
	}, [tableViews.length]);

	return (
		<div className={styles.viewListContainer}>
			{/* Create New Button */}
			<button
				className={styles.createNewButton}
				onClick={() => setCreateModalOpen(true)}
			>
				<Plus size={16} className={styles.createNewIcon} />
				<span>Create new view</span>
			</button>

			{/* Search */}
			<ViewSearch onSearch={handleSearch} />

			{/* View List */}
			<div className={styles.viewList}>
				{filteredViews.length === 0 ? (
					<div className={styles.emptyState}>
						<div className={styles.emptyStateText}>
							{searchQuery
								? "No views found"
								: "No views yet. Create your first view!"}
						</div>
						{!searchQuery && (
							<button
								className={styles.emptyStateButton}
								onClick={() => setCreateModalOpen(true)}
							>
								Create new view
							</button>
						)}
					</div>
				) : (
					filteredViews.map((view) => (
						<ViewListItem
							key={view.id}
							view={view}
							isActive={view.id === currentViewId}
							onClick={handleViewClick}
							onMenuClick={handleMenuClick}
							onRename={handleInlineRename}
							isRenaming={renamingViewId === view.id}
							onRenameCancel={() => setRenamingViewId(null)}
						/>
					))
				)}
			</div>

			{/* Context Menu */}
			<ViewContextMenu
				anchorEl={contextMenuAnchor}
				open={Boolean(contextMenuAnchor)}
				onClose={handleCloseContextMenu}
				view={contextMenuView}
				onRename={(view) => handleStartRename(view)}
				onDelete={handleDeleteClick}
				canDelete={canDelete}
			/>

			{/* Create View Modal */}
			<CreateViewModal
				open={createModalOpen}
				onClose={() => setCreateModalOpen(false)}
				columns={columns}
			/>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				open={deleteConfirmOpen}
				title="Delete View"
				description={
					viewToDelete
						? `Are you sure you want to delete "${viewToDelete.name}"? This action cannot be undone.`
						: "Are you sure you want to delete this view?"
				}
				confirmText="DELETE"
				cancelText="CANCEL"
				confirmButtonVariant="contained"
				onConfirm={handleDeleteConfirm}
				onCancel={handleDeleteCancel}
				showIcon={true}
			/>
		</div>
	);
}

export default ViewList;
