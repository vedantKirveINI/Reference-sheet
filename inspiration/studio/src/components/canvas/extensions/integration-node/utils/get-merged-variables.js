const VARIABLE_TYPES = {
  LOCAL: "LOCAL",
  GLOBAL: "GLOBAL",
  NODE: "NODE",
  HIDDEN_PARAMS: "HIDDEN_PARAMS",
  QUERY_PARAMS: "QUERY_PARAMS",
};

const createEmptyVariables = () => ({
  [VARIABLE_TYPES.LOCAL]: [],
  [VARIABLE_TYPES.GLOBAL]: [],
  [VARIABLE_TYPES.NODE]: [],
  [VARIABLE_TYPES.HIDDEN_PARAMS]: [],
  [VARIABLE_TYPES.QUERY_PARAMS]: [],
});

export const getMergedVariables = (
  projctVariables = {},
  userVariables = {}
) => {
  const variables = createEmptyVariables();
  const addedVariables = new Set();

  const addVariables = (type, newVariables = []) => {
    newVariables.forEach((variable) => {
      if (!variable._id || addedVariables.has(variable._id)) return;
      addedVariables.add(variable._id);
      variables[type].push(variable);
    });
  };

  // Adding user variables as project varaibles does not consist below variables
  const arrayTypes = [
    VARIABLE_TYPES.NODE,
    VARIABLE_TYPES.HIDDEN_PARAMS,
    VARIABLE_TYPES.QUERY_PARAMS,
  ];

  arrayTypes.forEach((type) => {
    variables[type].push(...(userVariables[type] || []));
  });

  // Varaibles type which consits in both project and user variables which can have duplicates
  const deduplicatedTypes = [VARIABLE_TYPES.LOCAL, VARIABLE_TYPES.GLOBAL];

  // First add user variables (higher priority)
  deduplicatedTypes.forEach((type) => {
    addVariables(type, userVariables[type]);
  });

  // Then add project variables (lower priority)
  deduplicatedTypes.forEach((type) => {
    addVariables(type, projctVariables[type]);
  });

  return variables;
};
