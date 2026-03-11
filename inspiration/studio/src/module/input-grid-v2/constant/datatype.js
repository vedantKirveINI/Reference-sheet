export const NON_PRIMITIVE = ["object", "array"];
export const PRIMITIVE = ["string", "number", "boolean", "int"];
export const ANY_TYPE = ["any"];

const DATA_TYPE = [...PRIMITIVE, ...NON_PRIMITIVE, ...ANY_TYPE];

export default DATA_TYPE;
