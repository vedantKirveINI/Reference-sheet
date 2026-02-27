import isEmpty from "lodash/isEmpty";
import { useForm, useWatch } from "react-hook-form";

import { ORDER_BY_OPTIONS_MAPPING } from "../constant";
import getSortControls from "../utils/getSortControls";

const defaultSortObj = {
	field: undefined,
	order: ORDER_BY_OPTIONS_MAPPING[0],
};

function useSortContentHandler({
	onSave = () => {},
	updatedSortObjs = [],
	sortFieldOptions = [],
}) {
	const defaultValues = {
		sortObjs: isEmpty(updatedSortObjs) ? [defaultSortObj] : updatedSortObjs,
	};

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		defaultValues,
	});

	const selectedFields = useWatch({
		control,
		name: "sortObjs",
	});

	const filteredSortFieldOptions = () => {
		const selectedFieldsIds = selectedFields?.map(
			(selectedField) => selectedField?.field?.value,
		);

		return (sortFieldOptions || []).filter(
			(option) => !(selectedFieldsIds || []).includes(option?.value),
		);
	};

	const controls = getSortControls({
		filteredSortFieldOptions,
	});

	const onSubmit = (data) => {
		const { sortObjs = [] } = data || {};

		const updatedSortObjs = sortObjs.map((sortObj) => {
			const { field = {}, order = {} } = sortObj || {};

			return {
				fieldId: field?.value,
				order: order?.value,
				dbFieldName: field?.dbFieldName,
				type: field?.type,
			};
		});

		onSave(updatedSortObjs);
	};

	return {
		errors,
		control,
		controls,
		onSubmit,
		handleSubmit,
	};
}

export default useSortContentHandler;
