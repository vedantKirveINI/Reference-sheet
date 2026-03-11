export const getInitials = (value, seperator = " ", capitalize = true) => {
  if (!value) return "";
  return value
    .split(seperator)
    .map((x) => {
      let _value = x.substr(0, 1);
      if (capitalize) {
        return _value.toUpperCase();
      }
      return _value;
    })
    .join("");
};
