import isEmpty from "lodash/isEmpty";
import { useForm } from "react-hook-form";

import { getNewMapDataTypeControls } from "../config/getNewMapDataTypeControls";

function useMapDataType({ formData = {} }) {
	const { columnsInfo = [] } = formData || {};

	const remainingCSVFields = columnsInfo.reduce((acc, column) => {
		// If it's an unmapped field (no dbFieldName) but has a csvName
		if (column?.unMappedCsvName && isEmpty(column?.dbFieldName)) {
			acc.push(column.unMappedCsvName);
		}
		return acc;
	}, []);

	const defaultValues = {
		map_type_fields: remainingCSVFields.map((field) => ({
			field: field, // field is of type text
			type: { label: "Short Text", value: "SHORT_TEXT" },
		})),
	};

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues,
	});

	const controls = getNewMapDataTypeControls();

	return {
		control,
		handleSubmit,
		errors,
		controls,
	};
}

export default useMapDataType;
