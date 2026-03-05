import { OTHER } from '../constants/categories';
import { FUNCTIONS, KEYWORDS, OPERATORS, VARIABLES } from '../constants/types';
import { blockStyle } from './common-styles';

export const otherData = {
  [VARIABLES]: [],
  [FUNCTIONS]: [
    {
      value: "isEmpty",
      category: OTHER,
      subCategory: "FUNCTIONS",
      description:
        "Returns true if value in the parameter is empty, null, {}, [] or undefined and false otherwise.",
      args: [
        {
          name: "value",
        },
      ],
      returnType: "boolean",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>isEmpty(</span><span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11"> = true</p>\n      </div>`,
      examples: [
        {
          formula: "isEmpty()",
          result: "true"
        },
        {
          formula: "isEmpty(text)",
          result: "false"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "isEmptyOrNull",
      category: OTHER,
      subCategory: "FUNCTIONS",
      description:
        "Returns true if value in the parameter is empty, null or undefined and false otherwise.",
      args: [
        {
          name: "value",
        },
      ],
      returnType: "boolean",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>isEmptyOrNull(</span><span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11"> = true</p>\n      </div>`,
      examples: [
        {
          formula: "isEmptyOrNull(null)",
          result: "true"
        },
        {
          formula: "isEmptyOrNull(\"text\")",
          result: "false"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "isNotEmpty",
      category: OTHER,
      subCategory: "FUNCTIONS",
      description:
        "Returns true if value in the parameter is not empty, null, {}, [] or undefined and false otherwise.",
      args: [
        {
          name: "value",
          type: "any",
        },
      ],
      returnType: "boolean",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>isNotEmpty(</span>OUTE<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11"> = true</p>\n      </div>`,
      examples: [
        {
          formula: "isNotEmpty(\"text\")",
          result: "true"
        },
        {
          formula: "isNotEmpty(\"\")",
          result: "false"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "isNotEmptyOrNull",
      category: OTHER,
      subCategory: "FUNCTIONS",
      description:
        "Returns true if value in the parameter is not empty, null or undefined and false otherwise.",
      args: [
        {
          name: "value",
        },
      ],
      returnType: "boolean",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>isNotEmptyOrNull(</span>OUTE<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11"> = true</p>\n      </div>`,
      examples: [
        {
          formula: "isNotEmptyOrNull(\"text\")",
          result: "true"
        },
        {
          formula: "isNotEmptyOrNull(null)",
          result: "false"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "isValueExists",
      category: OTHER,
      subCategory: "FUNCTIONS",
      description:
        "Returns true if search value exists in the provided src argument.",
      args: [
        {
          name: "src",
          type: ["string", "array"],
        },
        {
          name: "search_value",
          type: "any",
        },
      ],
      returnType: "boolean",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000; flex-direction: column;">\n        <div style="display:flex; color:#000;"><p><span style=${blockStyle}>isValueExits(</span>OUTE<span style=${blockStyle}>,</span>O<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11"> = true</p></div>\n  <div style="display:flex; color:#000;"><p><span style=${blockStyle}>isValueExits(</span>["OUTE"]<span style=${blockStyle}>,</span>OUTE<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11"> = true</p></div>\n    </div>`,
      examples: [
        {
          formula: "isValueExists(\"OUTE\", \"O\")",
          result: "true"
        },
        {
          formula: "isValueExists([\"OUTE\"], \"OUTE\")",
          result: "true"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "merge",
      category: OTHER,
      subCategory: "FUNCTIONS",
      description: "Returns merged data from two objects.",
      args: [
        {
          name: "arg1",
          required: true,
        },
        {
          name: "arg2",
          required: true,
        },
      ],
      returnType: "object",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>merge(</span>{"month": 1}<span style=${blockStyle}>,</span>{"year": 2021}<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">= {"month": 1, "year": 2021}</p>\n      </div>`,
      examples: [
        {
          formula: "merge({\"month\": 1}, {\"year\": 2021})",
          result: "{ month: 1, year: 2021 }"
        },
        {
          formula: "merge({\"a\": 1}, {\"b\": 2})",
          result: "{ a: 1, b: 2 }"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "toObject",
      category: OTHER,
      subCategory: "FUNCTIONS",
      description: "Converts a JSON string to an object.",
      args: [
        {
          name: "value",
          type: "string",
          required: true,
        },
      ],
      returnType: "object",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>toObject(</span>{"name": "John"}<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">={"name": "John"}</p>\n      </div>`,
      examples: [
        {
          formula: "toObject({\"name\": \"John\"})",
          result: "{\"name\": \"John\"}"
        },
        {
          formula: "toObject({\"age\": 30})",
          result: "{\"age\": 30}"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "toStringify",
      category: OTHER,
      subCategory: "FUNCTIONS",
      description: "Converts an object to a JSON string.",
      args: [
        {
          name: "value",
          type: "object",
          required: true,
        },
      ],
      returnType: "string",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>toStringify(</span>{"name": "John"}<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">="{\\"name\\":\\"John\\"}"</p>\n      </div>`,
      examples: [
        {
          formula: "toStringify({\"name\": \"John\"})",
          result: "\"{\\\"name\\\":\\\"John\\\"}\""
        },
        {
          formula: "toStringify({\"age\": 30})",
          result: "\"{\\\"age\\\":30}\""
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "getValueByPath",
      category: OTHER,
      subCategory: "FUNCTIONS",
      description: "Gets the value of an object at the specified path.",
      args: [
        {
          name: "value",
          type: "object",
          required: true,
        },
        {
          name: "path_str",
          type: "string",
          required: true,
        },
      ],
      returnType: "any",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">\n<p><span style=${blockStyle}>getValueByPath(</span>{"name": {"first": "John"}}<span style=${blockStyle}>,</span>"name.first"<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">="John"</p>\n      </div>`,
      examples: [
        {
          formula: "getValueByPath({\"name\": {\"first\": \"John\"}}, name.first)",
          result: "\"John\""
        },
        {
          formula: "getValueByPath({\"user\": {\"id\": 123}}, user.id)",
          result: "123"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "getKeys",
      category: OTHER,
      subCategory: "FUNCTIONS",
      description: "Gets the keys of an object.",
      args: [
        {
          name: "value",
          type: "object",
          required: true,
        },
      ],
      returnType: "array",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>getKeys(</span>{"name": "John", "age": 30}<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">=["name", "age"]</p>\n      </div>`,
      examples: [
        {
          formula: "getKeys({\"name\": \"John\", \"age\": 30})",
          result: "[\"name\", \"age\"]"
        },
        {
          formula: "getKeys({\"a\": 1, \"b\": 2, \"c\": 3})",
          result: "[\"a\", \"b\", \"c\"]"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "getValues",
      category: OTHER,
      subCategory: "FUNCTIONS",
      description: "Gets the values of an object.",
      args: [
        {
          name: "value",
          type: "object",
          required: true,
        },
      ],
      returnType: "array",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>getValues(</span>{"name": "John", "age": 30}<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">=["John", 30]</p>\n      </div>`,
      examples: [
        {
          formula: "getValues({\"name\": \"John\", \"age\": 30})",
          result: "[\"John\", 30]"
        },
        {
          formula: "getValues({\"a\": 1, \"b\": 2})",
          result: "[1, 2]"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
  ],
  [OPERATORS]: [
    {
      value: "(",
      category: OTHER,
      subCategory: "OPERATORS",
      description: "Opening Bracket",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all", "tables"],
    },
    {
      value: ")",
      category: OTHER,
      subCategory: "OPERATORS",
      description: "Closing Bracket",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all", "tables"],
    },
    {
      value: ",",
      category: OTHER,
      subCategory: "OPERATORS",
      description: "Argument separator",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all", "tables"],
    },
  ],
  [KEYWORDS]: [
    {
      value: null,
      displayValue: "null",
      category: OTHER,
      subCategory: "KEYWORDS",
      description: `<div>Null (null)</div>`,
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: undefined,
      displayValue: "Ignore",
      category: OTHER,
      subCategory: "KEYWORDS",
      description: `<div>Ignore (undefined)</div>`,
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
    },
  ],
};
