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
	columnMeta?: string | null;
	sortColumnBg?: string;
	filterColumnBg?: string;
	isDefaultView?: boolean;
	fetchRecords?: () => Promise<void> | void;
	hasNewRecords?: boolean;
	clearHasNewRecords?: () => void;
	isTableLoading?: boolean;
}

type ViewType = "grid" | "kanban";

interface ViewComponentConfig {
	component: React.ComponentType<any>;
	props?: Record<string, any>;
	key?: string;
}

interface ViewConfig {
	components: ViewComponentConfig[];
}

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
				key: JSON.stringify(props.group?.groupObjs || []),
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

	const parsedColumnMeta = useMemo(() => {
		return parseColumnMeta(columnMeta);
	}, [columnMeta]);

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
		<div className="flex items-center justify-between py-2 px-6 bg-[#fafafa] border-b border-[#e0e0e0] min-h-[44px] gap-4 max-md:px-4 max-md:flex-wrap max-md:gap-2">
			<div className="flex items-center gap-2 max-md:flex-wrap max-md:gap-1">
				{viewConfig.components.map((config) => {
					const Component = config.component;

					const key = config.key;
					return <Component key={key} {...(config.props || {})} />;
				})}
			</div>
			{!isDefaultView && fetchRecords && (
				<button
					type="button"
					className={`inline-flex items-center gap-2.5 px-4 py-2 min-h-[36px] border border-[#d0d0d0] rounded-lg bg-white cursor-pointer text-sm font-medium text-[#333] transition-all duration-200 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:enabled:bg-[#f5f5f5] hover:enabled:border-[#b0b0b0] hover:enabled:shadow-[0_1px_3px_rgba(0,0,0,0.08)] active:enabled:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-80 ${hasNewRecords ? "!bg-gradient-to-br !from-[#e6f4ff] !to-[#bae0ff] !border-[#1890ff] !text-[#0958d9] !shadow-[0_1px_3px_rgba(24,144,255,0.25)] hover:enabled:!bg-gradient-to-br hover:enabled:!from-[#bae0ff] hover:enabled:!to-[#91caff] hover:enabled:!border-[#1677ff] hover:enabled:!shadow-[0_2px_6px_rgba(24,144,255,0.35)]" : ""} ${isTableLoading ? "pointer-events-none" : ""}`}
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
					<span className="relative inline-flex items-center justify-center">
						{isTableLoading ? (
							<Loader2 size={18} className="flex-shrink-0 text-inherit animate-spin" />
						) : (
							<>
								<RefreshCw size={18} className={`flex-shrink-0 ${hasNewRecords ? "text-[#1677ff]" : "text-[#555]"}`} />
								{hasNewRecords && (
									<span
										className="absolute -top-[3px] -right-[3px] w-2.5 h-2.5 rounded-full bg-[#1677ff] border-2 border-white flex-shrink-0 box-content shadow-[0_0_0_1px_rgba(22,119,255,0.5)]"
										aria-label="New updates"
									/>
								)}
							</>
						)}
					</span>
					<span className="font-medium whitespace-nowrap max-md:hidden">
						{isTableLoading ? "Syncing…" : "SYNC"}
					</span>
				</button>
			)}
		</div>
	);
}

export default SubHeader;
