// eslint-disable-next-line no-unused-vars
import DataFieldType from "./data-field-type";

class DataField {
  /**
   *
   * @param {string} key
   * @param {string} value
   * @param {DataFieldType} type
   * @param {string} defaultValue
   * @param {boolean} required
   * @param {RegExp} regex
   */
  constructor(
    key,
    value = "",
    type = DataFieldType.STRING,
    defaultValue = "",
    required = false,
    regex = null
  ) {
    this.key = key;
    this.value = value;
    this.type = type;
    this.default = defaultValue;
    this.required = required;
    this.regex = regex;
  }
}
export default DataField;
