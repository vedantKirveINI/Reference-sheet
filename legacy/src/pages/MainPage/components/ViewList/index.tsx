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

const normalizeViewType = (viewType: string): "grid" | "kanban" => {
	if (viewType === "kanban") return "kanban";
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

	const tableViews = useMemo(() => {
		return views.filter((view) => view.tableId === tableId);
	}, [views, tableId]);

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
				return false;
			}
		},
		[renameView, tableId, baseId],
	);

	const handleDeleteClick = useCallback(
		(view: IView) => {
			if (preventLastViewDeletion()) {
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
		<div className="flex flex-col gap-2 overflow-visible min-w-0">
			{/* Create New Button */}
			<button
				className="flex items-center gap-2 py-2.5 px-3 border-none bg-none rounded-lg cursor-pointer transition-all duration-200 text-sm text-[#333] w-full text-left mb-2 whitespace-nowrap overflow-visible flex-shrink-0 hover:bg-[#f5f5f5] [&_span]:overflow-visible [&_span]:whitespace-nowrap"
				onClick={() => setCreateModalOpen(true)}
			>
				<Plus size={16} className="text-base flex-shrink-0" />
				<span>Create new view</span>
			</button>

			{/* Search */}
			<ViewSearch onSearch={handleSearch} />

			{/* View List */}
			<div className="flex flex-col gap-1">
				{filteredViews.length === 0 ? (
					<div className="py-8 px-4 text-center text-[#666] text-sm">
						<div className="mb-2">
							{searchQuery
								? "No views found"
								: "No views yet. Create your first view!"}
						</div>
						{!searchQuery && (
							<button
								className="text-[#1a73e8] cursor-pointer underline hover:text-[#1557b0]"
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
