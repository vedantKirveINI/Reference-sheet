// View Type Icons - Using lucide-react
import React from "react";
import {
	Grid3x3,
	Columns,
	Calendar,
	Image,
	List,
	FileText,
	Layout,
	GanttChartSquare,
	GitBranch,
} from "lucide-react";
import { ViewType } from "@/types/view";

// Icon mapping for view types
export const VIEW_TYPE_ICON_MAP: Record<
	ViewType,
	React.ComponentType<{ size?: number; className?: string }>
> = {
	[ViewType.DefaultGrid]: Grid3x3,
	[ViewType.Grid]: Grid3x3,
	[ViewType.Kanban]: Columns,
	[ViewType.Calendar]: Calendar,
	[ViewType.Gallery]: Image,
	[ViewType.List]: List,
	[ViewType.Gantt]: GanttChartSquare,
	[ViewType.Form]: FileText,
	[ViewType.Timeline]: GitBranch, // Using GitBranch as Timeline icon (represents branching timeline)
	[ViewType.Section]: Layout,
};

// Helper function to get icon component for a view type
export const getViewIcon = (
	viewType: string,
): React.ComponentType<{ size?: number; className?: string }> => {
	const type = viewType.toLowerCase() as ViewType;
	// default_grid and grid both use grid icon
	if (type === "default_grid") return VIEW_TYPE_ICON_MAP[ViewType.DefaultGrid];
	return VIEW_TYPE_ICON_MAP[type] || VIEW_TYPE_ICON_MAP[ViewType.Grid];
};

// ViewIcon component for easy usage
interface ViewIconProps {
	type: string;
	size?: number;
	className?: string;
}

export const ViewIcon: React.FC<ViewIconProps> = ({
	type,
	size = 18,
	className,
}) => {
	const IconComponent = getViewIcon(type);
	return <IconComponent size={size} className={className} />;
};
