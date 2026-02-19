// Phase 1: GroupBy Panel Component using ODS
// Reference: teable/packages/sdk/src/components/base-query/editors/QueryGroup.tsx

import React, { useEffect, useMemo } from "react";
import type { IGroupConfig, IGroupObject } from "@/types/grouping";
import { useGroupByPlaygroundStore } from "@/stores/groupByPlaygroundStore";
import GroupByRow from "./GroupByRow";
import AddGroupByButton from "./AddGroupByButton";

interface GroupByPanelProps {
	fields?: Array<{ id: number; name: string; type: string }>;
	onChange?: (config: IGroupConfig | null) => void;
}

const GroupByPanel: React.FC<GroupByPanelProps> = ({
	fields = [],
	onChange,
}) => {
	const { groupConfig, setGroupConfig } = useGroupByPlaygroundStore();

	// Create a new object reference for reliable change detection
	// This ensures the effect triggers when groupConfig changes
	// Creating a new reference ensures React detects the change even if Zustand doesn't create a new reference
	const groupConfigRef = useMemo(() => {
		if (!groupConfig) return null;
		// Create a new object reference with a copy of groupObjs
		return {
			groupObjs: [...(groupConfig.groupObjs || [])],
		};
	}, [groupConfig]);

	// Notify parent whenever groupConfig changes (from any source)
	// Use the new reference to detect changes
	useEffect(() => {
		if (onChange) {
			onChange(groupConfig);
		}
	}, [groupConfigRef, groupConfig, onChange]);

	const handleAddGroup = (groupObj: IGroupObject) => {
		const newConfig: IGroupConfig = {
			groupObjs: [...(groupConfig?.groupObjs || []), groupObj],
		};
		setGroupConfig(newConfig);
		// onChange will be called by useEffect when groupConfig updates
	};

	const handleRemoveGroup = (index: number) => {
		if (!groupConfig) return;
		const newGroupObjs = groupConfig.groupObjs.filter(
			(_, i) => i !== index,
		);
		const newConfig: IGroupConfig | null =
			newGroupObjs.length > 0 ? { groupObjs: newGroupObjs } : null;
		setGroupConfig(newConfig);
		// onChange will be called by useEffect when groupConfig updates
	};

	const handleUpdateGroup = (index: number, updatedGroup: IGroupObject) => {
		if (!groupConfig) return;
		const newGroupObjs = [...groupConfig.groupObjs];
		newGroupObjs[index] = updatedGroup;
		const newConfig: IGroupConfig = { groupObjs: newGroupObjs };
		setGroupConfig(newConfig);
		// onChange will be called by useEffect when groupConfig updates
	};

	return (
		<div style={{ padding: "16px", minWidth: "400px" }}>
			<div style={{ marginBottom: "16px" }}>
				<h3 style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
					Group By
				</h3>
				<p
					style={{
						margin: "4px 0 0 0",
						fontSize: "12px",
						color: "#666",
					}}
				>
					Organize rows by field values
				</p>
			</div>

			<div
				style={{ display: "flex", flexDirection: "column", gap: "8px" }}
			>
				{groupConfig?.groupObjs.map((groupObj, index) => (
					<GroupByRow
						key={index}
						groupObj={groupObj}
						fields={fields}
						onUpdate={(updated) =>
							handleUpdateGroup(index, updated)
						}
						onRemove={() => handleRemoveGroup(index)}
					/>
				))}

				<AddGroupByButton
					fields={fields}
					existingFieldIds={
						groupConfig?.groupObjs.map((g) => g.fieldId) || []
					}
					onAdd={handleAddGroup}
				/>
			</div>
		</div>
	);
};

export default GroupByPanel;
