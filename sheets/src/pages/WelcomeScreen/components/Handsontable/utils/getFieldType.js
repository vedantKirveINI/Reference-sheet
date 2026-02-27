import { FIELD_TYPE_MAPPING } from "../../../../../constants/fieldMapping";

export const getFieldProperty = (fieldType, property, defaultValue) => {
	return FIELD_TYPE_MAPPING[fieldType]?.[property] || defaultValue;
};

export const getFieldType = ({ fieldType }) => {
	if (FIELD_TYPE_MAPPING?.[fieldType]) {
		return FIELD_TYPE_MAPPING[fieldType];
	}

	return FIELD_TYPE_MAPPING?.["UNKNOWN"];
};
