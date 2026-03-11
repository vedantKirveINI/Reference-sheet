class RequestMethodType {
  static GET = "GET";

  static POST = "POST";

  static PUT = "PUT";

  static PATCH = "PATCH";

  static DELETE = "DELETE";

  getAllRequestMethodTypes() {
    return [
      RequestMethodType.GET,
      RequestMethodType.POST,
      RequestMethodType.PUT,
      RequestMethodType.PATCH,
      RequestMethodType.DELETE,
    ];
  }
}
export default RequestMethodType;
