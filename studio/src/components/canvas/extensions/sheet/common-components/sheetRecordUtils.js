import questionDataTypeMapping from "@src/module/input-grid-v2/constant/questionDataTypeMapping";
import lowerCase from "lodash/lowerCase";
import startCase from "lodash/startCase";

/**
 * Check if a field has a complex schema (Object type with subFields)
 * @param {string} fieldType - The field type to check
 * @returns {Array|null} - The schema arra  y if complex type, null otherwise
 */
export function getComplexTypeSchema(fieldType) {
  if (!fieldType) return null;
  const upperType = String(fieldType).toUpperCase().trim();
  const mapping = questionDataTypeMapping[upperType];
  if (mapping && mapping.type === "Object" && Array.isArray(mapping.schema) && mapping.schema.length > 0) {
    return mapping.schema;
  }
  return null;
}

/**
 * Serialize subFields to a value object
 * @param {Object} subFields - Object containing subField values
 * @param {Array} schema - Schema array defining the subFields structure
 * @returns {Object|null} - Serialized value object or null
 */
export function serializeSubFieldsToValue(subFields, schema) {
  if (!subFields || !schema) return null;

  const valueObject = {};
  schema.forEach((subField) => {
    const subFieldValue = subFields[subField.key];
    if (subFieldValue?.blockStr) {
      valueObject[subField.key] = subFieldValue.blockStr;
    } else if (subFieldValue?.blocks?.length > 0) {
      const firstBlock = subFieldValue.blocks[0];
      valueObject[subField.key] = firstBlock?.value || "";
    } else {
      valueObject[subField.key] = "";
    }
  });

  return valueObject;
}

/**
 * Create a complex value object from subFields
 * @param {Object} subFields - Object containing subField values
 * @param {Array} schema - Schema array defining the subFields structure
 * @returns {Object} - Complex value object with type "fx", blocks, and blockStr
 */
export function createComplexValueFromSubFields(subFields, schema) {
  // const serialized = serializeSubFieldsToValue(subFields, schema);
  // if (!serialized) return { type: "fx", blocks: [], blockStr: "" };

  // return {
  //   type: "fx",
  //   blocks: [{ type: "PRIMITIVES", value: serialized }],
  //   blockStr: JSON.stringify(serialized),
  //   objectValue: serialized,
  // };

  return mapSchemaToConfig({ schema, subFields });

}


const mapSchemaToConfig = ({ schema = [], subFields }) => {
  return schema.map((item, index) => {
    return {
      id: `${Date.now()}_${index}`,
      ...item,
      isChecked: false,
      type: startCase(item.type || "String"),
      isValueMode: true,
      value: subFields[item.key] || undefined,
    };
  });
};  
