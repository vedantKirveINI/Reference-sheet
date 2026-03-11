import startCase from "lodash/startCase";

const getTypeValue = ({
  alias = "",
  type = "",
  allowQuestionDataType = false,
}) => {
  if (alias && allowQuestionDataType) return startCase(alias);

  if (type) return startCase(type);

  return "String";
};

export default getTypeValue;
