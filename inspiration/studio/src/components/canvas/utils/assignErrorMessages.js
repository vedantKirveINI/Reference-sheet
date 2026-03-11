import isEmpty from "lodash/isEmpty";

const assignErrorMessages = ({ errors = [], errorTabsMapping = {} }) => {
  if (isEmpty(errors)) {
    return {
      0: [],
      1: [],
    };
  }

  const errorMessages = errors?.reduce(
    (acc, error) => {
      const tabIndex = Object.keys(errorTabsMapping).findIndex((tab) =>
        errorTabsMapping[tab].includes(error)
      );

      if (tabIndex !== -1) {
        acc[tabIndex] = [...(acc[tabIndex] || []), error];
      }
      return acc;
    },
    {
      0: [],
      1: [],
    }
  );

  return errorMessages;
};

export default assignErrorMessages;
