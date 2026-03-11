import { lowerCase, startCase } from "lodash";
import { NON_PRIMITIVE } from "../constant/datatype";

const mapSchemaToConfig = ({ schema = [], isValueMode }) => {
  const CONFIG_KEY = isValueMode ? "value" : "schema";

  return schema.map((item, index) => {
    if (NON_PRIMITIVE.includes(lowerCase(item.type)) && item?.schema) {
      return {
        id: `${Date.now()}_${index}`,
        ...item,
        isChecked: false,
        [CONFIG_KEY]: mapSchemaToConfig({
          schema: item.schema,
          isValueMode,
        }),
        isValueMode,
      };
    }

    return {
      id: `${Date.now()}_${index}`,
      ...item,
      isChecked: false,
      type: startCase(item.type || "String"),
      isValueMode,
    };
  });
};

export default mapSchemaToConfig;
