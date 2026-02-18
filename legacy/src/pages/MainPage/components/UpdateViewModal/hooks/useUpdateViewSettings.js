import { useForm } from "react-hook-form";
import { getKanbanControls } from "../../CreateViewModal/controls";

/**
 * Hook for updating Kanban view settings
 * @param {Object} params
 * @param {Array} params.columns - Array of column/field objects
 * @returns {Object} { formHook, controls, stackingFieldOptions }
 */
function useUpdateViewSettings({ columns = [] }) {
	const controls = getKanbanControls(columns);

	// Get the stackingField control to access options
	const stackingFieldControl = controls.find(
		(control) => control.name === "stackingField"
	);
	const stackingFieldOptions = stackingFieldControl?.options || [];

	// Initialize form with empty default values
	// Values will be set via setValue when viewOptions become available
	const formHook = useForm({
		defaultValues: {
			stackingField: null,
			hideEmptyStack: false,
		},
	});

	return {
		formHook,
		controls,
		stackingFieldOptions,
	};
}

export default useUpdateViewSettings;

