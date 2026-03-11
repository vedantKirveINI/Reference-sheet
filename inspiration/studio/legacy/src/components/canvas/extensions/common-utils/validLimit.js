const isValidLimit = (limit) => {
  // Use loose equality (==) to check for both null and undefined
  // null == null and undefined == null both return true
  if (limit == null || limit === "") return false;
  const numLimit = Number(limit);
  return !isNaN(numLimit) && numLimit > 0 && Number.isInteger(numLimit);
};

export default isValidLimit;
