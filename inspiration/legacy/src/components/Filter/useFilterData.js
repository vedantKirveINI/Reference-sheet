import isEmpty from "lodash/isEmpty";
import { showAlert } from "oute-ds-alert";
import { useRef } from "react";

import useDecodedUrlParams from "../../hooks/useDecodedUrlParams";
import useRequest from "../../hooks/useRequest";
import truncateName from "../../utils/truncateName";

import DateTimeFilter from "./component/DateTime";
import DropdownFilter from "./component/Dropdown";
import Input from "./component/Input";
import Mcq from "./component/Mcq";
import Rating from "./component/Rating";
import Scq from "./component/Scq";
import YesNo from "./component/YesNo";
import { TEXT_BASED_FILTER_TYPES, UNSUPPORTED_TYPES_SET } from "./constants";

function useFilterData({
	setPopover = () => {},
	fields = [],
	onFilterChange = () => {},
}) {
	const { tableId, viewId, assetId } = useDecodedUrlParams();

	const conditionRef = useRef(null);

	const [{ loading: filterLoading }, trigger] = useRequest(
		{
			method: "put",
			url: "/view/update_filter",
		},
		{ manual: true },
	);

	const supportedFieldTypes = fields.filter(
		(field) => !UNSUPPORTED_TYPES_SET.has(field.type),
	);

	const updatedSchema = supportedFieldTypes.map((info) => {
		if (TEXT_BASED_FILTER_TYPES.includes(info?.type)) {
			return { ...info, component: Input, field: info?.id };
		} else if (info?.type === "YES_NO") {
			return {
				...info,
				component: YesNo,
				field: info?.id,
				componentProps: info?.options,
			};
		} else if (info?.type === "SCQ") {
			return {
				...info,
				component: Scq,
				field: info?.id,
				componentProps: info?.options,
			};
		} else if (info?.type === "DROP_DOWN") {
			return {
				...info,
				component: DropdownFilter,
				field: info?.id,
				componentProps: info?.options,
			};
		} else if (info?.type === "MCQ" || info?.type === "DROP_DOWN_STATIC") {
			return {
				...info,
				component: Mcq,
				field: info?.id,
				componentProps: info?.options,
			};
		} else if (info?.type === "DATE" || info?.type === "CREATED_TIME") {
			return {
				...info,
				component: DateTimeFilter,
				field: info?.id,
				componentProps: info?.options,
			};
		} else if (["NUMBER", "ZIP_CODE"].includes(info?.type)) {
			return {
				...info,
				component: Input,
				field: info?.id,
				componentProps: {
					type: "number",
				},
			};
		} else if (info?.type === "PHONE_NUMBER") {
			return {
				...info,
				useCustomComponent: true,
				field: info?.id,
			};
		} else if (info?.type === "RATING") {
			return {
				...info,
				component: Rating,
				field: info?.id,
				componentProps: info?.options,
			};
		} else if (info?.type === "FORMULA") {
			if (info?.options?.returnType === "NUMBER") {
				return {
					...info,
					component: Input,
					field: info?.id,
					componentProps: {
						type: "number",
					},
				};
			} else {
				return {
					...info,
					component: Input,
					field: info?.id,
				};
			}
		}

		return info;
	});

	const fieldsObject = fields.reduce((acc, field) => {
		acc[field?.id] = field;
		acc[field?.dbFieldName] = field;
		return acc;
	}, {});

	const getUpdatedFilter = ({ filter }) => {
		if (isEmpty(filter)) return {};

		const { childs = [] } = filter || {};

		const updatedChildInfo = childs
			.map((ele) => {
				if (ele?.childs) {
					return getUpdatedFilter({ filter: ele });
				}

				const fieldInfo = fieldsObject[ele?.field];

				// Add key (field name) and type (field type) if not already present
				return {
					...ele,
					key: ele?.key || fieldInfo?.name,
					type: ele?.type || fieldInfo?.type,
				};
			})
			.filter((filterItem) => filterItem?.childs || filterItem?.key);

		return {
			...filter,
			childs: updatedChildInfo,
		};
	};

	const applyFilter = async ({ condition = {}, rawCondition = {} }) => {
		try {
			await trigger({
				data: {
					id: viewId,
					tableId,
					baseId: assetId,
					filter: condition,
					should_stringify: true,
				},
			});

			onFilterChange(rawCondition);
			setPopover(false);
		} catch (error) {
			showAlert({
				type: "error",
				message: `${
					truncateName(error?.response?.data?.message) ||
					"Could not apply Filter"
				}`,
			});
		}
	};

	const onApplyHandler = () => {
		const condition = conditionRef.current.getSanitizedData();
		const { childs } = condition || {};

		if (isEmpty(childs)) {
			applyFilter({ rawCondition: {} });
			return;
		}

		applyFilter({ condition, rawCondition: condition });
	};

	const handleClick = async () => {
		setPopover((prev) => !prev);
	};

	return {
		schema: updatedSchema,
		onApplyHandler,
		conditionRef,
		filterLoading,
		handleClick,
		getUpdatedFilter,
	};
}

export default useFilterData;
