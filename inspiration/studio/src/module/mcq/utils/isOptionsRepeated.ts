export const isOptionRepeated = (
  options: string[],
  currentOption: string
): boolean => {
  const occurrences = options.filter(
    (option) => option === currentOption
  ).length;
  return occurrences > 1;
};
