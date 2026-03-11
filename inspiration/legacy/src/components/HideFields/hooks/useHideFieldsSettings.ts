import { useForm } from "react-hook-form";
import { useMemo } from "react";
import { IColumn } from "@/types";
import { getColumnHiddenState } from "@/utils/columnMetaUtils";
import { getHideFieldsControls } from "../configuration/getHideFieldsControls";

interface UseHideFieldsSettingsProps {
	columns: IColumn[];
	parsedColumnMeta: Record<string, any>;
	primaryFieldId: string | null;
}

function useHideFieldsSettings({
	columns,
	parsedColumnMeta,
	primaryFieldId,
}: UseHideFieldsSettingsProps) {
	// Initialize default values for form (store isVisible: true = visible, false = hidden)
	const defaultValues = useMemo(() => {
		const values: Record<string, boolean> = {};
		columns.forEach((col) => {
			const fieldId = String((col as any).rawId || col.id);
			// Form stores isVisible (inverted from is_hidden)
			// true = visible, false = hidden
			const isHidden = getColumnHiddenState(fieldId, parsedColumnMeta);
			values[fieldId] = !isHidden;
		});
		return values;
	}, [columns, parsedColumnMeta]);

	// Setup React Hook Form
	const formHook = useForm<Record<string, boolean>>({
		defaultValues,
		mode: "onChange",
	});

	// Generate controls dynamically
	const controls = useMemo(() => {
		return getHideFieldsControls(columns, primaryFieldId);
	}, [columns, primaryFieldId]);

	return {
		formHook,
		controls,
		defaultValues,
	};
}

export default useHideFieldsSettings;
