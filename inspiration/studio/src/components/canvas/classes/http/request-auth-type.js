class RequestAuthType {
  static NONE = { label: "None", id: "none" };

  static BASIC = { label: "Basic", id: "basic" };

  static BEARER = { label: "Bearer Token", id: "bearer" };

  getAllRequestAuthTypes() {
    return [
      RequestAuthType.NONE,
      RequestAuthType.BASIC,
      RequestAuthType.BEARER,
    ];
  }
}

export default RequestAuthType;
