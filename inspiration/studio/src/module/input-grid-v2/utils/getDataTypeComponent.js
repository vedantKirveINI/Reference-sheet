import { lowerCase } from "lodash";
import DATA_TYPE_COMPONENT_MAPPING from "../constant/datatypeComponentMapping";

const getDataTypeComponent = (type) => {
  if (!type) return null;

  return DATA_TYPE_COMPONENT_MAPPING[lowerCase(type)];
};

export default getDataTypeComponent;
