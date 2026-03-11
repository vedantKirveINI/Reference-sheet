import { TEXT_AND_BINARY } from '../constants/categories.jsx';
import { FUNCTIONS, KEYWORDS, OPERATORS, VARIABLES } from '../constants/types.jsx';
import { blockStyle } from './common-styles.jsx';

export const textData = {
  [VARIABLES]: [],
  [FUNCTIONS]: [
    {
      value: "concatenate",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description:
        "Joins together the text arguments into a single text value.To concatenate static text, surround it with double quotation marks. To concatenate double quotation marks, you need to use a backslash () as an escape character.Equivalent to use of the & operator.",
      args: [
        {
          name: "text1; text2;...",
          type: "string",
          required: true,
          repeat: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>concatenate(</span>Bob<span style=${blockStyle}>;</span> - <span style=${blockStyle}>;</span>43<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">=Bob - 43</p>\n      </div>`,
      group: "",
      applicableFor: ["all", "tables"],
    },
    {
      value: "find",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description:
        "Finds an occurrence of stringToFind in whereToSearch string starting from an optional startFromPosition.(startFromPosition is 0 by default.) If no occurrence of stringToFind is found, the result will be 0.Similar to SEARCH(), though SEARCH() returns empty rather than 0 if no occurrence of stringToFind is found.",
      args: [
        {
          name: "stringToFind",
          type: "string",
          required: true,
        },
        {
          name: "whereToSearch",
          type: "string",
          required: true,
        },
        {
          name: "startFromPosition",
          type: "number",
          required: false,
        },
      ],
      returnType: "number",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>find(</span>fox<span style=${blockStyle}>;</span>quick brown fox<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">=13</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "search",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description:
        "Searches for an occurrence of stringToFind in whereToSearch string starting from an optional startFromPosition. (startFromPosition is 0 by default.) If no occurrence of stringToFind is found, the result will be empty.Similar to FIND(), though FIND() returns 0 rather than empty if no occurrence of stringToFind is found.",
      args: [
        {
          name: "stringToFind",
          type: "string",
          required: true,
        },
        {
          name: "whereToSearch",
          type: "string",
          required: true,
        },
      ],
      returnType: "number",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>search(</span>World<span style=${blockStyle}>;</span>Hello World<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">=7</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "trim",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description: "Removes whitespace at the beginning and end of the string.",
      args: [
        {
          name: "string",
          required: true,
          type: "string",
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>trim(</span> Hello! <span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">=Hello!</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "len",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description: "Returns the length of a string.",
      args: [
        {
          name: "string",
          type: "string",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>len(</span>quick brown fox<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">=15</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "substitute",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description:
        "Replaces occurrences of old_text with new_text.You can optionally specify an index number (starting from 1) to replace just a specific occurrence of old_text. If no index number is specified, then all occurrences of old_text will be replaced.(If you're looking for a way to replace characters in a string from a specified start point instead, see REPLACE().)Looking for examples of how you can use SUBSTITUTE()? ",
      args: [
        {
          name: "string",
          type: "string",
          required: true,
        },
        {
          name: "old_text",
          type: "string",
          required: true,
        },
        {
          name: "new_text",
          type: "string",
          required: true,
        },
        {
          name: "index",
          type: "number",
          required: false,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>substitute(</span>gold mold<span style=${blockStyle}>;</span>old<span style=${blockStyle}>;</span>et<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">=get met</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "replace",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description:
        "Replaces the number of characters beginning with the start character with the replacement text.(If you're looking for a way to find and replace all occurrences of old_text with new_text, see SUBSTITUTE().)",
      args: [
        {
          name: "string",
          type: "string",
          required: true,
        },
        {
          name: "start_character",
          type: "number",
          required: true,
        },
        {
          name: "number_of_characters",
          type: "number",
          required: true,
        },
        {
          name: "replacement",
          type: "string",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>replace(</span>database<span style=${blockStyle}>;</span>1<span style=${blockStyle}>;</span>5<span style=${blockStyle}>;</span>o<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">= dose</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "lower",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description: "Makes a string lowercase.",
      args: [
        {
          name: "string",
          type: "string",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>lower(</span>Hello!<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">= hello!</p>\n      </div>`,
      group: "",
      applicableFor: ["all", "tables"],
    },
    {
      value: "upper",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description: "Makes a string uppercase.",
      args: [
        {
          name: "string",
          type: "string",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>upper(</span>Hello!<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">= HELLO!</p>\n      </div>`,
      group: "",
      applicableFor: ["all", "tables"],
    },
    {
      value: "rept",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description: "Repeats string by the specified number of times.",
      args: [
        {
          name: "string",
          type: "string",
          required: true,
        },
        {
          name: "number",
          type: "number",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>rept(</span>Hi! <span style=${blockStyle}>;</span>3<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">= Hi! Hi! Hi!</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "left",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description:
        "Extract howMany characters from the beginning of the string.",
      args: [
        {
          name: "string",
          type: "string",
          required: true,
        },
        {
          name: "howMany",
          type: "number",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>left(</span>quick brown fox<span style=${blockStyle}>;</span>5<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">= quick</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "mid",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description:
        "Extract a substring of count characters starting at whereToStart.",
      args: [
        {
          name: "string",
          type: "string",
          required: true,
        },
        {
          name: "whereToStart",
          type: "number",
          required: true,
        },
        {
          name: "count",
          type: "number",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>mid(</span>quick brown fox<span style=${blockStyle}>;</span>6<span style=${blockStyle}>;</span>5<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">= brown</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "right",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description: "Extract howMany characters from the end of the string.",
      args: [
        {
          name: "string",
          type: "string",
          required: true,
        },
        {
          name: "howMany",
          type: "number",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>right(</span>quick brown fox<span style=${blockStyle}>;</span>5<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">= n fox</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "encode",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description:
        "Replaces certain characters with encoded equivalents for use in constructing URLs or URIs. Does not encode the following characters: - _ . ~",
      args: [
        {
          name: "component_string",
          type: "string",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>encode(</span>chicken & waffles<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">= chicken%20%26%20waffles</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "toBase64",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description: "Encodes a string to base64.",
      args: [
        {
          name: "value",
          type: "string",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>toBase64(</span>hello world<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">="aGVsbG8gd29ybGQ="</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "fromBase64",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description: "Decodes a base64 encoded string.",
      args: [
        {
          name: "value",
          type: "string",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>fromBase64(</span>aGVsbG8gd29ybGQ=<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">="hello world"</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "regexMatch",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description:
        "Returns whether the input text matches a regular expression.",
      args: [
        {
          name: "string",
          type: "string",
          required: true,
        },
        {
          name: "regex",
          type: "string",
          required: true,
        },
      ],
      returnType: "boolean",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>regexmatch(</span>Hello World<span style=${blockStyle}>;</span>Hello.World<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">= 1</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "regexExtract",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description:
        "Returns the first substring that matches a regular expression.",
      args: [
        {
          name: "string",
          type: "string",
          required: true,
        },
        {
          name: "regex",
          type: "string",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>regexextract(</span>Hello World<span style=${blockStyle}>;</span>W.*<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">= "World"</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "regexReplace",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description:
        "Substitutes all matching substrings with a replacement string value.",
      args: [
        {
          name: "string",
          type: "string",
          required: true,
        },
        {
          name: "regex",
          type: "string",
          required: true,
        },
        {
          name: "replacement",
          type: "string",
          required: true,
        },
      ],
      returnType: "string",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>regexreplace(</span>Hello World<span style=${blockStyle}>;</span> W.*<span style=${blockStyle}>;</span><span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">= "Hello"</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "split",
      category: TEXT_AND_BINARY,
      subCategory: "FUNCTIONS",
      description:
        "Splits the input string into an array of substrings using the specified separator. An optional limit parameter specifies the maximum number of splits. If limit is provided, the output will contain at most limit elements.",
      args: [
        {
          name: "value",
          type: "string",
          required: true,
        },
        {
          name: "separator",
          type: "string",
          required: true,
        },
        {
          name: "limit",
          type: "number",
          required: false,
        },
      ],
      returnType: "array",
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">\n        <p><span style=${blockStyle}>split(</span>apple,banana,cherry<span style=${blockStyle}>;</span>,<span style=${blockStyle}>;</span>2<span style=${blockStyle}>)</span></p>\n        <p style="color: grey; fontSize: 11">=["apple", "banana"]</p>\n      </div>`,
      group: "",
      applicableFor: ["all"],
    },
  ],
  [OPERATORS]: [],
  [KEYWORDS]: [
    {
      value: "",
      displayValue: "emptyString",
      category: TEXT_AND_BINARY,
      subCategory: "KEYWORDS",
      description: `<div>Empty String ("")</div>`,
      args: null,
      returnType: "",
      background: "#D9F8D4",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: " ",
      displayValue: "space",
      category: TEXT_AND_BINARY,
      subCategory: "KEYWORDS",
      description: `<div>Space (" ")</div>`,
      args: null,
      returnType: "",
      background: "#D9F8D4",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "\n",
      displayValue: "newline",
      category: TEXT_AND_BINARY,
      subCategory: "KEYWORDS",
      description: `Adds a new line.`,
      args: null,
      returnType: "",
      background: "#D9F8D4",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "\t",
      displayValue: "tab",
      category: TEXT_AND_BINARY,
      subCategory: "KEYWORDS",
      description: `Adds a tab.`,
      args: null,
      returnType: "",
      background: "#D9F8D4",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
  ],
};






