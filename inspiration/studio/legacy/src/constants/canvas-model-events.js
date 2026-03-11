export const CANVAS_MODEL_EVENTS = {
  DELETE: "Delete",
  REMOVE_LINK_DATA: "removeLinkData",
  CREATE_LINK_DATA: "createLinkData",
};

export const shouldCheckReferences = (eventName = "") => {
  if (typeof eventName !== "string") {
    return false;
  }
  return [
    CANVAS_MODEL_EVENTS.DELETE,
    CANVAS_MODEL_EVENTS.REMOVE_LINK_DATA,
    CANVAS_MODEL_EVENTS.CREATE_LINK_DATA,
  ].includes(eventName);
};
