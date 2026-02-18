import { useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";

import getCreateViewControls, { getKanbanControls } from "../controls";
import { ViewType } from "@/types/view";
import { CellType } from "@/types";

const fieldDefaultValues = {
	name: "",
	type: ViewType.Grid,
	stackingField: null,
	hideEmptyStack: false,
};

function getDefaultValue({ value, columns = [] }) {
	// Filter SCQ fields
	const scqFields = columns.filter(
		(col) =>
			col.rawType === "SCQ" ||
			col.type === CellType.SCQ ||
			col.type === "SCQ",
	);

	// Auto-select first SCQ field if available
	// IMPORTANT: columns.id = dbFieldName, but rawId = actual field ID
	// Use rawId (actual field ID) instead of id (dbFieldName)
	const defaultStackingField =
		scqFields.length > 0 ? (scqFields[0].rawId ?? scqFields[0].id) : null;

	return {
		...fieldDefaultValues,
		name: value?.name || "",
		type: value?.type || ViewType.Grid,
		stackingField: value?.stackingField || defaultStackingField,
		hideEmptyStack: value?.hideEmptyStack || false,
	};
}

function useCreateViewSettings({ value = {}, columns = [] }) {
	const baseControls = getCreateViewControls();

	const createViewDefaultValue = getDefaultValue({ value, columns });

	const formHook = useForm({
		defaultValues: createViewDefaultValue,
	});

	// Watch the type field to conditionally include Kanban controls
	const viewType = formHook.watch("type");
	const actualViewType = viewType?.value || viewType || ViewType.Grid;

	// Conditionally include Kanban controls when Kanban is selected
	const controls = useMemo(() => {
		if (actualViewType === ViewType.Kanban) {
			const kanbanControls = getKanbanControls(columns);
			return [...baseControls, ...kanbanControls];
		}
		return baseControls;
	}, [actualViewType, columns, baseControls]);

	// Reset Kanban fields when view type changes
	useEffect(() => {
		if (actualViewType !== ViewType.Kanban) {
			formHook.setValue("stackingField", null);
			formHook.setValue("hideEmptyStack", false);
		} else {
			// Auto-select first SCQ field when switching to Kanban
			const scqFields = columns.filter(
				(col) =>
					col.rawType === "SCQ" ||
					col.type === CellType.SCQ ||
					col.type === "SCQ",
			);
			if (scqFields.length > 0 && !formHook.getValues("stackingField")) {
				// IMPORTANT: columns.id = dbFieldName, but rawId = actual field ID
				// Use rawId (actual field ID) instead of id (dbFieldName)
				const firstScqField = scqFields[0].rawId ?? scqFields[0].id;
				formHook.setValue("stackingField", firstScqField);
			}
		}
	}, [actualViewType, columns, formHook]);

	return {
		formHook,
		controls,
	};
}

export default useCreateViewSettings;
