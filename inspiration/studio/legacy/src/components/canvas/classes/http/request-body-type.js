class RequestBodyType {
  static NONE = "none";

  static FORM_DATA = "form-data";

  static X_WWW_FORM_URL_ENCODED = "x-www-form-urlencoded";

  static BINARY = "binary";

  static RAW = "raw";

  getAllRequestBodyTypes() {
    return [
      RequestBodyType.NONE,
      RequestBodyType.FORM_DATA,
      RequestBodyType.X_WWW_FORM_URL_ENCODED,
      RequestBodyType.BINARY,
      RequestBodyType.RAW,
    ];
  }
}
export default RequestBodyType;
