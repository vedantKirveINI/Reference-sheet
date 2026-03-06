export const getInitialQuery = ({
  initialSearchQuery,
  isLoadingQuestionType,
}) => {
  if (initialSearchQuery) {
    return initialSearchQuery;
  }
  if (isLoadingQuestionType) {
    return "";
  }
  return "random";
};
