export const appendFieldKey = (data) => {
  if (!data || !data?.length) {
    return [];
  }
  return data?.map((d) => {
    return {
      ...d,
      field: d?.id || d?.dbFieldName,
    };
  });
};

export const sortSchemaFields = (array, orderObj) => {
  return array.sort((a, b) => {
    const orderA = orderObj[a.id]?.order ?? Infinity;
    const orderB = orderObj[b.id]?.order ?? Infinity;
    return orderA - orderB;
  });
};

export const convertFieldIdToName = ({ fields, output }) => {
  const fieldIdToName = {};

  let normalizedOutput = output;

  if (!Array.isArray(normalizedOutput)) {
    normalizedOutput = [normalizedOutput];
  }

  fields.forEach((field) => {
    fieldIdToName[field?.id] = field?.name;
  });

  const updatedOutput = normalizedOutput.map((data) => {
    let updatedData = {};

    Object.entries(data).forEach(([key, value]) => {
      if (fieldIdToName[key]) {
        updatedData[fieldIdToName[key]] = value;
      } else {
        updatedData[key] = value;
      }
    });

    return updatedData;
  });

  return updatedOutput;
};

export const normalizeFieldType = (fieldType) => {
  if (!fieldType) return "text";
  const type = String(fieldType).toLowerCase().trim().replace(/[\s_-]+/g, '');

  const typeMap = {
    "number": "number",
    "integer": "number",
    "int": "number",
    "float": "number",
    "double": "number",
    "decimal": "number",
    "currency": "number",
    "percent": "number",
    "rating": "number",
    "autonumber": "number",
    "boolean": "boolean",
    "bool": "boolean",
    "checkbox": "boolean",
    "toggle": "boolean",
    "date": "date",
    "datetime": "datetime",
    "createdtime": "datetime",
    "lastmodifiedtime": "datetime",
    "time": "time",
    "email": "email",
    "phone": "text",
    "phonenumber": "text",
    "url": "url",
    "link": "url",
    "json": "json",
    "object": "json",
    "array": "array",
    "multiselect": "array",
    "singleselect": "text",
    "select": "text",
    "dropdown": "text",
    "text": "text",
    "string": "text",
    "singlelinetext": "text",
    "longtext": "textarea",
    "textarea": "textarea",
    "richtext": "textarea",
    "multilinetext": "textarea",
    "attachment": "text",
    "file": "text",
    "collaborator": "text",
    "user": "text",
    "formula": "text",
    "rollup": "text",
    "lookup": "text",
    "linkedrecord": "text",
  };

  return typeMap[type] || "text";
};

export const buildFieldConfig = ({ sortedFields, nodeName = 'SheetNode' }) => {
  const config = {};
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[${nodeName}] Building fieldConfig from sortedFields:`, sortedFields);
  }
  sortedFields.forEach((field) => {
    if (field?.id) {
      const normalizedType = normalizeFieldType(field.type);
      const labelValue = {
        label: field.name || field.label || field.id,
        type: normalizedType,
        placeholder: field.placeholder,
      };
      config[field.id] = labelValue;
      config[`data_${field.id}`] = labelValue;
      config[`record_${field.id}`] = labelValue;
      if (field.name && field.name !== field.id) {
        config[field.name] = labelValue;
      }
    }
  });
  return config;
};