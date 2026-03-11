// @ts-ignore - Filter component is implemented in JSX
import Filter from "@/components/Filter";
import Sort from "@/components/Sort";
import Zoom from "@/components/Zoom";
import RowHeightControl from "@/components/RowHeightControl";
import GroupByModal from "@/components/GroupBy";
import {
	StackedByButton,
	CustomizeCardsButton,
} from "@/components/KanbanControls";
import { useUIStore } from "@/stores/uiStore";
import { RowHeightLevel } from "@/types";
import React, { useMemo } from "react";
import { RefreshCw, Loader2 } from "lucide-react";
import styles from "./styles.module.scss";
import HideFields from "@/components/HideFields/HideFields";
import { parseColumnMeta } from "@/utils/columnMetaUtils";

interface SubHeaderProps {
	zoomLevel?: number;
	onZoomChange?: (level: number) => void;
	fields?: Array<{
		id: number;
		name: string;
		type: string;
		dbFieldName?: string;
	}>;
	filter?: Record<string, unknown>;
	sort?: Record<string, unknown>;
	group?: Record<string, unknown>;
	onFilterChange?: (filter: Record<string, unknown>) => void;
	setView: (view: Record<string, unknown>) => void;
	currentView?: "grid" | "kanban";
	stackFieldName?: string;
	// New props for StackedByButton
	columns?: Array<{
		id: number | string;
		name: string;
		type: string;
		rawId?: number | string;
		[key: string]: any;
	}>;
	viewOptions?: {
		stackFieldId?: string | number | null;
		isEmptyStackHidden?: boolean;
	} | null;
	viewId?: string;
	onStackFieldSuccess?: (updatedView: any) => void;
	stackFieldLoading?: boolean;
	columnMeta?: string | null; // columnMeta JSON string from view
	sortColumnBg?: string; // Theme color for sorted column highlighting
	filterColumnBg?: string; // Theme color for filtered column highlighting
	/** When false, show Fetch records button (non-default views only). */
	isDefaultView?: boolean;
	fetchRecords?: () => Promise<void> | void;
	hasNewRecords?: boolean;
	clearHasNewRecords?: () => void;
	/** When true, show loading state on Fetch records button. */
	isTableLoading?: boolean;
}

type ViewType = "grid" | "kanban";

interface ViewComponentConfig {
	component: React.ComponentType<any>;
	props?: Record<string, any>;
	key?: string; // Optional key for React reconciliation
}

interface ViewConfig {
	components: ViewComponentConfig[];
}

// View-specific component configurations
// This makes it easy to add new views - just add a new entry here
const getViewConfig = (
	viewType: ViewType,
	props: {
		fields: SubHeaderProps["fields"];
		filter: SubHeaderProps["filter"];
		sort: SubHeaderProps["sort"];
		group: SubHeaderProps["group"];
		onFilterChange: SubHeaderProps["onFilterChange"];
		setView: SubHeaderProps["setView"];
		zoomLevel: number;
		onZoomChange: SubHeaderProps["onZoomChange"];
		rowHeightLevel: RowHeightLevel;
		setRowHeightLevel: (level: RowHeightLevel) => void;
		stackFieldName?: string;
		columns?: SubHeaderProps["columns"];
		viewOptions?: SubHeaderProps["viewOptions"];
		viewId?: SubHeaderProps["viewId"];
		onStackFieldSuccess?: SubHeaderProps["onStackFieldSuccess"];
		stackFieldLoading?: SubHeaderProps["stackFieldLoading"];
		parsedColumnMeta?: Record<string, any>;
		sortColumnBg?: string;
		filterColumnBg?: string;
	},
): ViewConfig => {
	const commonComponents: ViewComponentConfig[] = [
		{
			component: Filter,
			props: {
				filter: props.filter,
				fields: props.fields,
				onFilterChange: props.onFilterChange,
				activeBackgroundColor: props.filterColumnBg,
			},
		},
		{
			component: Sort,
			props: {
				sort: props.sort,
				fields: props.fields,
				activeBackgroundColor: props.sortColumnBg,
			},
		},
	];

	const viewSpecificComponents: Record<ViewType, ViewComponentConfig[]> = {
		grid: [
			{
				component: HideFields,
				props: {
					columns: props.columns || [],
					parsedColumnMeta: props.parsedColumnMeta || {},
					viewId: props.viewId || "",
				},
			},
			{
				component: GroupByModal,
				props: {
					groupBy: props.group,
					fields: props.fields,
					setView: props.setView,
				},
				key: JSON.stringify(props.group?.groupObjs || []), // Special key for GroupByModal
			},
			{
				component: RowHeightControl,
				props: {
					value: props.rowHeightLevel,
					onChange: props.setRowHeightLevel,
				},
			},
			{
				component: Zoom,
				props: {
					zoomLevel: props.zoomLevel,
					setZoomLevel: props.onZoomChange,
				},
			},
		],
		kanban: [
			{
				component: StackedByButton,
				props: {
					stackFieldName: props.stackFieldName,
					columns: props.columns,
					viewOptions: props.viewOptions,
					viewId: props.viewId || "",
					onSuccess: props.onStackFieldSuccess,
					loading: props.stackFieldLoading,
				},
			},
			{
				component: CustomizeCardsButton,
			},
			{
				component: Zoom,
				props: {
					zoomLevel: props.zoomLevel,
					setZoomLevel: props.onZoomChange,
				},
			},
		],
	};

	return {
		components: [
			...commonComponents,
			...(viewSpecificComponents[viewType] || []),
		],
	};
};

function SubHeader({
	zoomLevel = 100,
	onZoomChange,
	fields = [],
	filter = {},
	sort = {},
	group = {},
	onFilterChange,
	setView,
	currentView = "grid",
	stackFieldName,
	columns,
	viewOptions,
	viewId,
	onStackFieldSuccess,
	stackFieldLoading,
	columnMeta,
	sortColumnBg,
	filterColumnBg,
	isDefaultView = true,
	fetchRecords,
	hasNewRecords = false,
	clearHasNewRecords,
	isTableLoading = false,
}: SubHeaderProps) {
	const { rowHeightLevel, setRowHeightLevel } = useUIStore();

	const handleFetchRecords = () => {
		if (isTableLoading) return;
		fetchRecords?.();
		clearHasNewRecords?.();
	};

	// Parse columnMeta for HideFields component
	const parsedColumnMeta = useMemo(() => {
		return parseColumnMeta(columnMeta);
	}, [columnMeta]);

	// Get view-specific component configuration
	const viewConfig = getViewConfig(currentView, {
		fields,
		filter,
		sort,
		group,
		onFilterChange,
		setView,
		zoomLevel,
		onZoomChange,
		rowHeightLevel,
		setRowHeightLevel,
		stackFieldName,
		columns,
		viewOptions,
		viewId,
		onStackFieldSuccess,
		stackFieldLoading,
		parsedColumnMeta,
		sortColumnBg,
		filterColumnBg,
	});

	return (
		<div className={styles.subHeader}>
			<div className={styles.toolbar}>
				{viewConfig.components.map((config) => {
					const Component = config.component;

					const key = config.key;
					return <Component key={key} {...(config.props || {})} />;
				})}
			</div>
			{!isDefaultView && fetchRecords && (
				<button
					type="button"
					className={`${styles.fetchRecordsButton} ${hasNewRecords ? styles.fetchRecordsButtonNew : ""} ${isTableLoading ? styles.fetchRecordsButtonLoading : ""}`}
					onClick={handleFetchRecords}
					disabled={isTableLoading}
					title={
						isTableLoading
							? "Syncing…"
							: hasNewRecords
								? "New updates available – click to sync"
								: "Sync latest data"
					}
					aria-label={
						isTableLoading
							? "Syncing"
							: hasNewRecords
								? "New updates – sync data"
								: "Sync data"
					}
				>
					<span className={styles.fetchRecordsIconWrap}>
						{isTableLoading ? (
							<Loader2 size={18} className={styles.fetchRecordsSpinner} />
						) : (
							<>
								<RefreshCw size={18} className={styles.fetchRecordsIcon} />
								{hasNewRecords && (
									<span
										className={styles.fetchRecordsBadge}
										aria-label="New updates"
									/>
								)}
							</>
						)}
					</span>
					<span className={styles.fetchRecordsLabel}>
						{isTableLoading ? "Syncing…" : "SYNC"}
					</span>
				</button>
			)}
		</div>
	);
}

export default SubHeader;
