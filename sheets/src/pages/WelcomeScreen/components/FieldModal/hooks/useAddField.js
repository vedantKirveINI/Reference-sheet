import isEmpty from "lodash/isEmpty";
import { showAlert } from "oute-ds-alert";
import { useRef } from "react";

import useRequest from "../../../../../hooks/useRequest";
import truncateName from "../../../../../utils/truncateName";
import useCreateEnrichmentField from "../../Handsontable/hooks/useCreateEnrichmentField";
import useUpdateEnrichmentField from "../../Handsontable/hooks/useUpdateEnrichmentField";
import useUpdateField from "../../Handsontable/hooks/useUpdateField";
import {
	ALLOWED_FIELD_TYPES_WITH_OPTIONS,
	IGNORE_KEYS_UPDATE_FIELD_PAYLOAD,
} from "../constant";

function useAddField({
	creationModal,
	setCreationModal = () => {},
	baseId = "",
	tableId = "",
	viewId = "",
}) {
	const contentRef = useRef(null);

	const { newFieldOrder = "", editField = {} } = creationModal || {};

	const { updateField, loading: updateLoading } = useUpdateField();

	const { createEnrichmentField, loading: createEnrichmentFieldLoading } =
		useCreateEnrichmentField();
	const { updateEnrichmentField, loading: updateEnrichmentFieldLoading } =
		useUpdateEnrichmentField();

	const [{ loading }, trigger] = useRequest(
		{
			method: "post",
			url: "/field/create_field",
		},
		{ manual: true },
	);

	const createField = async (data) => {
		try {
			await trigger({ data });
		} catch (error) {
			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message, 50) ||
					"Something went wrong"
				}`,
			});
		}
	};

	const handleFieldSave = async (data) => {
		const isEdit = !isEmpty(editField);

		const { type = "" } = data || {};

		const commonPayload = {
			baseId,
			viewId,
			tableId,
			...data,
		};

		if (isEdit) {
			const { order, id: fieldId, description = "" } = editField || {};

			const payload = {
				order,
				id: fieldId,
				description: description ?? "",
				...commonPayload,
			};

			if (type === "ENRICHMENT") {
				await updateEnrichmentField(payload);
			} else {
				await updateField(payload);
			}
		} else {
			const payload = {
				order: newFieldOrder,
				...commonPayload,
			};

			if (type === "ENRICHMENT") {
				await createEnrichmentField(payload);
			} else {
				await createField(payload);
			}
		}

		setCreationModal({ open: false });
	};

	const onSave = async () => {
		try {
			const { saveFormData = () => {} } = contentRef.current;

			const formData = await saveFormData();

			const expression = {};

			let updatedComputedFieldMeta = {};
			let config = {};

			const {
				name = "",
				description = "",
				type = {},
				formula = "",
				computedFieldMeta = {},
				entityType = "",
				identifier = [],
				fieldsToEnrich = [],
				...rest
			} = formData || {};

			if (!isEmpty(formula)) {
				expression.blocks = formula;
				expression.type = "FX";

				updatedComputedFieldMeta = {
					...computedFieldMeta,
					expression,
				};
			}

			if (isEmpty(computedFieldMeta)) {
				updatedComputedFieldMeta = undefined;
			}

			const { value = "" } = type || {};

			const isEdit = !isEmpty(editField);
			const filteredFormData = isEdit
				? Object.keys(rest).reduce((acc, key) => {
						// For specified field types, always include the options key
						if (
							key === "options" &&
							ALLOWED_FIELD_TYPES_WITH_OPTIONS.includes(value)
						) {
							acc[key] = rest[key];
						}
						// For all other field types, apply the normal ignore logic
						else if (
							!IGNORE_KEYS_UPDATE_FIELD_PAYLOAD.includes(key)
						) {
							acc[key] = rest[key];
						}
						return acc;
					}, {})
				: rest;

			if (isEmpty(filteredFormData?.options)) {
				filteredFormData.options = undefined;
			}

			if (isEdit && value === "ENRICHMENT") {
				config = {
					fieldsToEnrich,
					identifier,
				};

				filteredFormData.config = config;
				filteredFormData.entityType = entityType;
			}

			handleFieldSave({
				name,
				description: description,
				options: filteredFormData,
				type: value,
				computedFieldMeta: updatedComputedFieldMeta,
				expression: isEdit ? undefined : expression, // expression is not required for edit
				entityType: isEdit ? undefined : entityType,
				identifier: isEdit ? undefined : identifier,
				fieldsToEnrich: isEdit ? undefined : fieldsToEnrich,
			});
		} catch (error) {
			console.log("error:", error);
		}
	};

	return {
		loading:
			loading ||
			updateLoading ||
			createEnrichmentFieldLoading ||
			updateEnrichmentFieldLoading,
		contentRef,
		onSave,
	};
}

export default useAddField;
