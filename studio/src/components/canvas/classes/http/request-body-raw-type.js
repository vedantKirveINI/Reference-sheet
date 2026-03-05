class RequestBodyRawType {
  static TEXT = "text";

  static JSON = "json";

  static HTML = "html";

  static XML = "xml";

  static JAVASCRIPT = "javascript";

  getAllRequestBodyRawTypes() {
    return [
      RequestBodyRawType.TEXT,
      RequestBodyRawType.JSON,
      RequestBodyRawType.HTML,
      RequestBodyRawType.XML,
      RequestBodyRawType.JAVASCRIPT,
    ];
  }
}
export default RequestBodyRawType;
