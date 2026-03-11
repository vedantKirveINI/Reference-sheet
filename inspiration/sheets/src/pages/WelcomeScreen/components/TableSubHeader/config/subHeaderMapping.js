import colorIcon from "../../../../../assets/table-sub-header-icons/color_pallate_outlined.svg";
import filterIcon from "../../../../../assets/table-sub-header-icons/filter_list.svg";
import groupIcon from "../../../../../assets/table-sub-header-icons/group_icon.svg";
import rowIcon from "../../../../../assets/table-sub-header-icons/row_size.svg";
import sortIcon from "../../../../../assets/table-sub-header-icons/swap_vert.svg";
import visibilityIcon from "../../../../../assets/table-sub-header-icons/visibility_off.svg";

const SUB_HEADER_MAPPING = [
	{ key: "hideFields", title: "Hide Fields", icon: visibilityIcon },
	{ key: "filter", title: "Filter", icon: filterIcon },
	{ key: "group", title: "Group", icon: groupIcon },
	{ key: "sort", title: "Sort", icon: sortIcon },
	{ key: "color", title: "Color", icon: colorIcon },
	{ key: "rowSize", title: "Row Size", icon: rowIcon },
];

export default SUB_HEADER_MAPPING;
