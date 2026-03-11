function removeKeys({ obj, keysToRemove }) {
  let newObj = { ...obj };

  keysToRemove.forEach((key) => {
    delete newObj?.[key];
  });

  return newObj;
}

export default removeKeys;
