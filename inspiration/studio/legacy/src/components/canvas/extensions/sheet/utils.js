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
