import { isEmpty } from "lodash";

export const getRequiredFieldsMissing = ({
  enrichmentData,
  requiredFields,
}) => {
  const requiredFieldsMissing = requiredFields.filter((field) => {
    const currValue = enrichmentData?.[field.key];

    if (isEmpty(currValue) || isEmpty(currValue?.blocks)) {
      return true;
    }

    return false;
  });

  return requiredFieldsMissing;
};
