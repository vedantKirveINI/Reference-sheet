import isEmpty from "lodash/isEmpty";
import { useForm, useWatch } from "react-hook-form";
import { showAlert } from "@/lib/toast";

import { ORDER_BY_OPTIONS_MAPPING } from "../constant";
import getGroupByControls from "../utils/getGroupByControls";

const defaultGroupByObj = {
	field: undefined,
	order: ORDER_BY_OPTIONS_MAPPING[0],
};

const MAX_GROUP_BY_FIELDS = 3;

function useGroupByContentHandler({
	onSave = () => {},
	updatedGroupObjs = [],
	groupByFieldOptions = [],
}) {
	const defaultValues = {
		groupObjs: isEmpty(updatedGroupObjs)
			? [defaultGroupByObj]
			: updatedGroupObjs,
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
		name: "groupObjs",
	});

	const filteredGroupByFieldOptions = () => {
		const selectedFieldsIds = selectedFields?.map(
			(selectedField) => selectedField?.field?.value,
		);

		return (groupByFieldOptions || []).filter(
			(option) => !(selectedFieldsIds || []).includes(option?.value),
		);
	};

	const controls = getGroupByControls({
		filteredGroupByFieldOptions,
	});

	const onSubmit = (data) => {
		const { groupObjs = [] } = data || {};

		// Validate maximum 3 fields limit
		if (groupObjs.length > MAX_GROUP_BY_FIELDS) {
			showAlert({
				type: "error",
				message: `Maximum ${MAX_GROUP_BY_FIELDS} fields allowed for grouping`,
			});
			return;
		}

		const updatedGroupObjs = groupObjs.map((groupObj) => {
			const { field = {}, order = {} } = groupObj || {};

			return {
				fieldId: field?.value,
				order: order?.value,
				dbFieldName: field?.dbFieldName,
				type: field?.type,
			};
		});

		onSave(updatedGroupObjs);
	};

	return {
		errors,
		control,
		controls,
		onSubmit,
		handleSubmit,
	};
}

export default useGroupByContentHandler;
