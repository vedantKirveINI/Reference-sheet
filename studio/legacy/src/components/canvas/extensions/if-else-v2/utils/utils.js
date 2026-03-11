// Function to calculate dynamic character limits based on container width
export const calculateCharacterLimits = (
  containerWidth,
  averageCharWidth = 8
) => {
  // Reserve space for " ... " (5 characters) and some padding
  const reservedSpace = 5;
  const availableSpace = Math.max(
    0,
    containerWidth - reservedSpace * averageCharWidth
  );

  // Calculate characters based on available space
  const totalChars = Math.floor(availableSpace / averageCharWidth);

  // startChars should be 2/3 of total available characters
  const startChars = Math.floor((totalChars * 2) / 3);
  // endChars should be 1/4 of total available characters
  const endChars = Math.floor(totalChars / 4);

  // Ensure minimum values for readability
  return {
    startChars: Math.max(8, startChars),
    endChars: Math.max(4, endChars),
  };
};

export const getDefaultCondition = () => {
  return {
    id: Date.now(),
    operation: {
      value: "equals",
      label: "equals",
      valueInputs: [{ type: "string" }],
    },
    value: [],
  };
};
export const getOperators = (type) => {
  switch (type) {
    case "number":
      return [
        { label: "equals", value: "equals", valueInputs: [{ type: "number" }] },
        {
          label: "is greater than",
          value: "gt",
          valueInputs: [{ type: "number" }],
        },
        {
          label: "is less than",
          value: "lt",
          valueInputs: [{ type: "number" }],
        },
        {
          label: "is greater than or equal to",
          value: "gte",
          valueInputs: [{ type: "number" }],
        },
        {
          label: "is less than or equal to",
          value: "lte",
          valueInputs: [{ type: "number" }],
        },
        {
          label: "is between",
          value: "isBetween",
          description: [
            {
              title: "Description",
              value:
                "Checks if a given integer falls within a specified range (inclusive of both lower and upper limits).",
            },
            {
              title: "Example",
              value:
                "If value = 15 and the condition is in between 10 and 20, the result is true because 15 lies between 10 and 20.",
            },
          ],
          valueInputs: [
            {
              type: "number",
              placeholder: "Enter min value",
            },
            {
              type: "number",
              placeholder: "Enter max value",
            },
          ],
        },
      ];
    case "boolean":
      return [
        { value: "equals", label: "is", valueInputs: [{ type: "boolean" }] },
      ];
    case "object":
      return [
        {
          value: "hasKey",
          label: "has key",
          valueInputs: [{ type: "string" }],
        },
        {
          value: "hasKeyValue",
          label: "has key-value pair",
          valueInputs: [{ type: "string" }],
        },
        {
          value: "isEmpty",
          label: "is empty",
          valueInputs: [],
        },
      ];
    case "array":
      return [
        {
          value: "includes",
          label: "includes",
          valueInputs: [{ type: "string" }],
          allowOverride: true,
        },
        { value: "isEmpty", label: "is empty", valueInputs: [] },
        {
          value: "lengthEq",
          label: "has length equal to",
          valueInputs: [{ type: "number" }],
        },
        {
          value: "lengthGt",
          label: "has length greater than",
          valueInputs: [{ type: "number" }],
        },
        {
          value: "lengthLt",
          label: "has length less than",
          valueInputs: [{ type: "number" }],
        },
        {
          value: "lengthGte",
          label: "has length greater than or equal to",
          valueInputs: [{ type: "number" }],
        },
        {
          value: "lengthLte",
          label: "has length less than or equal to",
          valueInputs: [{ type: "number" }],
        },
      ];
    default:
      return [
        { value: "isEmpty", label: "is empty", valueInputs: [] },
        { value: "isNotEmpty", label: "is not empty", valueInputs: [] },
        {
          value: "equals",
          label: "equals",
          valueInputs: [{ type: "string" }],
          allowOverride: true,
        },
        {
          value: "contains",
          label: "contains",
          valueInputs: [{ type: "string" }],
        },
        {
          value: "startsWith",
          label: "starts with",
          valueInputs: [{ type: "string" }],
        },
        {
          value: "endsWith",
          label: "ends with",
          valueInputs: [{ type: "string" }],
        },
        {
          value: "lengthEq",
          label: "has length",
          valueInputs: [{ type: "number" }],
        },
        {
          value: "lengthGt",
          label: "has length >",
          valueInputs: [{ type: "number" }],
        },
        {
          value: "lengthLt",
          label: "has length <",
          valueInputs: [{ type: "number" }],
        },
        {
          value: "lengthGte",
          label: "has length >=",
          valueInputs: [{ type: "number" }],
        },
        {
          value: "lengthLte",
          label: "has length <=",
          valueInputs: [{ type: "number" }],
        },
        // { value: "equals", label: "equals" },
        // { value: "contains", label: "contains" },
        // { value: "startsWith", label: "starts with" },
        // { value: "endsWith", label: "ends with" },
        // { value: "gt", label: "is greater than" },
        // { value: "lt", label: "is less than" },
        // { value: "gte", label: "is greater than or equal to" },
        // { value: "lte", label: "is less than or equal to" },
        // { value: "hasKey", label: "has key" },
        // { value: "hasKeyValue", label: "has key-value pair" },
        // { value: "isEmpty", label: "is empty" },
        // { value: "includes", label: "includes" },
        // { value: "lengthEq", label: "has length =" },
        // { value: "lengthGt", label: "has length >" },
        // { value: "lengthLt", label: "has length <" },
        // { value: "lengthGte", label: "has length >=" },
        // { value: "lengthLte", label: "has length <=" },
      ];
  }
};
