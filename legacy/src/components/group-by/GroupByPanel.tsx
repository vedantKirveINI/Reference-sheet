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

	const groupConfigRef = useMemo(() => {
		if (!groupConfig) return null;
		return {
			groupObjs: [...(groupConfig.groupObjs || [])],
		};
	}, [groupConfig]);

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
	};

	const handleRemoveGroup = (index: number) => {
		if (!groupConfig) return;
		const newGroupObjs = groupConfig.groupObjs.filter(
			(_, i) => i !== index,
		);
		const newConfig: IGroupConfig | null =
			newGroupObjs.length > 0 ? { groupObjs: newGroupObjs } : null;
		setGroupConfig(newConfig);
	};

	const handleUpdateGroup = (index: number, updatedGroup: IGroupObject) => {
		if (!groupConfig) return;
		const newGroupObjs = [...groupConfig.groupObjs];
		newGroupObjs[index] = updatedGroup;
		const newConfig: IGroupConfig = { groupObjs: newGroupObjs };
		setGroupConfig(newConfig);
	};

	return (
		<div className="p-4 min-w-[400px]">
			<div className="mb-4">
				<h3 className="m-0 text-sm font-semibold">
					Group By
				</h3>
				<p className="mt-1 mb-0 text-xs text-[#666]">
					Organize rows by field values
				</p>
			</div>

			<div className="flex flex-col gap-2">
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
