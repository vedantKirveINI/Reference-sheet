import { ARRAY } from "../constants/categories.js";
import {
  FUNCTIONS,
  KEYWORDS,
  OPERATORS,
  VARIABLES,
} from "../constants/types.js";
import { blockStyle } from "./common-styles.js";

export const arrayData = {
  [VARIABLES]: [],
  [FUNCTIONS]: [
    {
      value: "getValueAt",
      category: ARRAY,
      subCategory: "FUNCTIONS",
      description: "Returns the value at the specified index in an array.",
      args: [
        {
          name: "array",
          required: true,
          repeat: false,
        },
        {
          name: "index",
          required: true,
          repeat: false,
        },
      ],
      returnType: "any",
      background: "#E5EAF1",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "size",
      category: ARRAY,
      subCategory: "FUNCTIONS",
      description: "Returns the number of items in an array.",
      args: [
        {
          name: "array",
          required: false,
          repeat: true,
        },
      ],
      returnType: "number",
      background: "#E5EAF1",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "arrayToJson",
      category: ARRAY,
      subCategory: "FUNCTIONS",
      description:
        "Converts an array to a JSON object using specified keys and values.",
      args: [
        {
          name: "array",
          required: true,
          type: "array",
          repeat: false,
        },
        {
          name: "search_keys",
          required: true,
          type: ["string", "array"],
          repeat: false,
        },
        {
          name: "search_values",
          required: true,
          type: ["string", "array"],
          repeat: false,
        },
      ],
      returnType: "object",
      background: "#E5EAF1",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "getValuesByKey",
      category: ARRAY,
      subCategory: "FUNCTIONS",
      description:
        "Returns values from an array of objects based on specified keys.",
      args: [
        {
          name: "array",
          required: true,
          repeat: false,
          type: "array",
        },
        {
          name: "search_keys",
          required: true,
          repeat: false,
          type: ["string", "array"],
        },
      ],
      returnType: "array",
      background: "#E5EAF1",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "uniq",
      category: ARRAY,
      subCategory: "FUNCTIONS",
      description:
        "Returns a new array with all duplicate elements removed from the input array.",
      args: [
        {
          name: "array",
          required: true,
          repeat: false,
          type: "array",
        },
      ],
      returnType: "array",
      background: "#E5EAF1",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "join",
      category: ARRAY,
      subCategory: "FUNCTIONS",
      description:
        "Creates and returns a new string by concatenating all elements of an array, separated by a specified delimiter.",
      args: [
        {
          name: "array",
          required: true,
          repeat: false,
          type: "array",
        },
        {
          name: "delimiter",
          required: true,
          repeat: false,
          type: "string",
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "slice",
      category: ARRAY,
      subCategory: "FUNCTIONS",
      description:
        "Returns a shallow copy of a portion of an array into a new array object selected from start to end (end not included). The original array will not be modified.",
      args: [
        {
          name: "value",
          type: "array",
          required: true,
        },
        {
          name: "start",
          type: "number",
          required: true,
        },
        {
          name: "end",
          type: "number",
          required: true,
        },
      ],
      returnType: "array",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>slice(</span>[1, 2, 3, 4, 5]<span style=${blockStyle}>;</span>1<span style=${blockStyle}>;</span> 3<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">=[2, 3]</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "modifyArray",
      category: ARRAY,
      subCategory: "FUNCTIONS",
      displayValue: "splice",
      description:
        "Modifies the contents of an array by removing or replacing existing elements and/or adding new elements in place. The start parameter specifies the index at which to start changing the array. The delete_count parameter specifies the number of elements to remove. Additional elements can be specified to be added to the array starting from the start index.",
      args: [
        {
          name: "value",
          type: "array",
          required: true,
        },
        {
          name: "start",
          type: "number",
          required: true,
        },
        {
          name: "delete_count",
          type: "number",
          required: true,
        },
        {
          name: "...ele",
          type: "any",
          required: false,
        },
      ],
      returnType: "array",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>splice(</span>[1, 2, 3, 4, 5]<span style=${blockStyle}>;</span> 1<span style=${blockStyle}>;</span> 2<span style=${blockStyle}>;</span> a<span style=${blockStyle}>;</span> b<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">=[1, 'a', 'b', 4, 5]</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "concat",
      category: ARRAY,
      displayValue: "concatArray",
      subCategory: "FUNCTIONS",
      module_name: "lodash",
      description:
        "Utility function used to create a new array by concatenating an initial array with additional arrays and/or individual values",
      args: [
        {
          name: "array",
          required: true,
          type: "array",
          repeat: true,
        },
        {
          name: "[values] (...*)",
          type: "any",
          required: false,
          repeat: true,
        },
      ],
      returnType: "number",
      background: "#E5EAF1",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
  ],
  [OPERATORS]: [],
  [KEYWORDS]: [],
};
