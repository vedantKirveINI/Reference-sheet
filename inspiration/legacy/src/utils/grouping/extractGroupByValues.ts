import type { IGroupLinearRow, IGroupConfig } from "@/types/grouping";
import type { ILinearRow } from "@/types";
import { LinearRowType } from "@/types";

export const extractGroupByFieldValues = (
	linearRow: IGroupLinearRow,
	groupConfig: IGroupConfig,
	linearRows: ILinearRow[],
	currentLinearIndex?: number,
): { [fieldId: string]: unknown } => {
	if (!groupConfig?.groupObjs || groupConfig.groupObjs.length === 0) {
		return {};
	}

	const groupByFieldValues: { [fieldId: string]: unknown } = {};
	const depth = linearRow.depth ?? 0;

	const index =
		currentLinearIndex !== undefined
			? currentLinearIndex
			: linearRows.findIndex((row) => row.id === linearRow.id);

	if (index < 0) {
		const groupObj = groupConfig.groupObjs[depth];
		if (groupObj) {
			groupByFieldValues[String(groupObj.fieldId)] =
				linearRow.value ?? null;
		}
		return groupByFieldValues;
	}

	const depthToGroupMap = new Map<number, IGroupLinearRow>();
	depthToGroupMap.set(depth, linearRow);

	const requiredParentDepths = new Set<number>();
	for (let d = 0; d < depth; d++) {
		requiredParentDepths.add(d);
	}

	for (let i = index - 1; i >= 0; i--) {
		const row = linearRows[i];
		if (row.type === LinearRowType.Group) {
			const groupRow = row as IGroupLinearRow;
			const rowDepth = groupRow.depth ?? 0;

			if (rowDepth < depth && !depthToGroupMap.has(rowDepth)) {
				depthToGroupMap.set(rowDepth, groupRow);
				requiredParentDepths.delete(rowDepth);
			}

			if (requiredParentDepths.size === 0) {
				break;
			}
		}
	}

	for (
		let targetDepth = 0;
		targetDepth < groupConfig.groupObjs.length;
		targetDepth++
	) {
		const groupObj = groupConfig.groupObjs[targetDepth];
		if (!groupObj) continue;

		const fieldId = String(groupObj.fieldId);
		const groupAtDepth = depthToGroupMap.get(targetDepth);
		groupByFieldValues[fieldId] = groupAtDepth?.value ?? null;
	}

	return groupByFieldValues;
};
