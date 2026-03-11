class DataFieldType {
  static STRING = "STRING";

  static INT = "INT";

  static NUMBER = "NUMBER";

  static BOOLEAN = "BOOLEAN";

  static JSON = "JSON";

  static HTML = "HTML";

  static XML = "XML";

  getAllDataFieldTypes() {
    return [
      DataFieldType.STRING,
      DataFieldType.INT,
      DataFieldType.NUMBER,
      DataFieldType.BOOLEAN,
      DataFieldType.JSON,
      DataFieldType.HTML,
      DataFieldType.XML,
    ];
  }
}
export default DataFieldType;
