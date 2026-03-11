/**
 * The `removeTagsFromString` function removes HTML tags from a given string.
 * @param [str] - The `str` parameter is a string that represents the input text from which you want to
 * remove HTML tags.
 * @returns The function `removeTagsFromString` returns a string with all HTML tags removed from the
 * input string.
 */
const removeTagsFromString = (str = "") => {
  const regex = /<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g;
  return str?.replace(regex, "");
};

/**
 * The function `sliceStringAndAppendElipses` takes a string and a limit as parameters, and returns the
 * string truncated to the specified limit with an ellipsis appended if necessary.
 * @returns The function `sliceStringAndAppendElipses` returns a string. If the length of the input
 * string `str` is less than or equal to the `limit`, it returns the original string `str`. Otherwise,
 * it slices the string from index 0 to the `limit` and appends ellipses (`...`) to the sliced string
 * before returning it.
 */
const sliceStringAndAppendElipses = (str = "", limit = 20) => {
  if (str?.length <= limit) {
    return str;
  }

  const slicedStr = str?.slice(0, limit);
  return `${slicedStr}...`;
};

export { removeTagsFromString, sliceStringAndAppendElipses };
