class RequestRawDataType {
  static TEXT = { id: "text", label: "Text", contentType: "text/plain" };

  static JSON = { id: "json", label: "JSON", contentType: "application/json" };

  static XML = { id: "xml", label: "XML", contentType: "text/xml" };

  static HTML = { id: "html", label: "HTML", contentType: "text/html" };

  static JAVASCRIPT = {
    id: "javascript",
    label: "Javascript",
    contentType: "application/javascript",
  };

  getAllRequestRawDataTypes() {
    return [
      RequestRawDataType.TEXT,
      RequestRawDataType.JSON,
      RequestRawDataType.XML,
      RequestRawDataType.HTML,
      RequestRawDataType.JAVASCRIPT,
    ];
  }
}
export default RequestRawDataType;
