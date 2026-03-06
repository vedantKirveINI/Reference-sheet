// static VARIABLES = "Variables"; //Handled seperately in FormulaBar.js
// static ARITHMETIC = "Arithmetic";
// static TEXT_AND_BINARY = "Text & Binary";
// static LOGICAL = "Logical";
// static DATE_AND_TIME = "Date & Time";
// static ARRAY = "Array";
// static OTHER = "Other";
export const blocks = [
  {
    label: "Arithmetic",
    variables: [],
    functions: [
      {
        value: "average",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Returns the average value for a set of numeric values within an array or when numeric values are entered individually.",
        args: [
          {
            name: "value1, [value2], ...",
            required: true,
            type: "number",
            repeat: true,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "sum",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Returns the sum of the values for a set of numeric values within an array or when numeric values are entered individually.",
        args: [
          {
            name: "value1, [value2], ...",
            required: true,
            type: "number",
            repeat: true,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "min",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description: "Returns the smallest of the given numbers.",
        args: [
          {
            name: "value1, [value2], ...",
            required: true,
            type: "number",
            repeat: true,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "max",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description: "Returns the largest of the given numbers.",
        args: [
          {
            name: "value1, [value2], ...",
            required: true,
            type: "number",
            repeat: true,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "floor",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Returns the nearest integer multiple of significance that is less than or equal to the value. If no significance is provided, a significance of 1 is assumed.",
        args: [
          {
            name: "value",
            required: true,
            type: "number",
            repeat: false,
          },
          {
            name: "[significance]",
            required: false,
            type: "number",
            repeat: false,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "ceiling",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Returns the nearest integer multiple of significance that is greater than or equal to the value. If no significance is provided, a significance of 1 is assumed.",
        args: [
          {
            name: "value",
            required: true,
            type: "number",
            repeat: false,
          },
          {
            name: "[significance]",
            required: false,
            type: "number",
            repeat: false,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "even",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Returns the smallest even integer that is greater than or equal to the specified value.",
        args: [
          {
            name: "value",
            required: true,
            type: "number",
            repeat: false,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "odd",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Rounds positive value up the the nearest odd number and negative value down to the nearest odd number.",
        args: [
          {
            name: "value",
            required: true,
            type: "number",
            repeat: false,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "round",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Rounds the value to the number of decimal places given by `precision`. (Specifically, ROUND will round to the nearest integer at the specified precision, with ties broken by rounding half up toward positive infinity.)",
        args: [
          {
            name: "value",
            required: true,
            type: "number",
            repeat: false,
          },
          {
            name: "precision",
            required: false,
            type: "number",
            repeat: false,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "rounddown",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Rounds the value to the number of decimal places given by `precision`, always rounding down, i.e., toward zero. (You must give a value for the precision or the function will not work.)",
        args: [
          {
            name: "value",
            required: true,
            type: "number",
            repeat: false,
          },
          {
            name: "precision",
            required: false,
            type: "number",
            repeat: false,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "roundup",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Rounds the value to the number of decimal places given by `precision`, always rounding up, i.e., away from zero. (You must give a value for the precision or the function will not work.)",
        args: [
          {
            name: "value",
            required: true,
            type: "number",
            repeat: false,
          },
          {
            name: "precision",
            required: false,
            type: "number",
            repeat: false,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "count",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description: "Count the number of numeric items.",
        args: [
          {
            name: "value1, [value2], ...",
            type: "number",
            required: true,
            repeat: true,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "counta",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Count the number of all elements. This function counts both numeric and text values.",
        args: [
          {
            name: "value1, [value2], ...",
            type: "string",
            required: true,
            repeat: true,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      // {
      //   value: "countall",
      //   category: "Arithmetic",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Count the number of all elements including text and blanks.",
      //   args: [
      //     {
      //       name: "value1; [value2]; ...",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      {
        value: "abs",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description: "Returns the absolute value.",
        args: [
          {
            name: "value",
            type: "number",
            required: true,
            repeat: true,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "exp",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description: "Computes Euler's number (e) to the specified power.",
        args: [
          {
            name: "power",
            type: "number",
            required: true,
            repeat: false,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "log",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Computes the logarithm of the value in provided base. The base defaults to 10 if not specified.",
        args: [
          {
            name: "number",
            type: "number",
            required: true,
            repeat: false,
          },
          {
            name: "[base]",
            type: "number",
            required: false,
            repeat: false,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "sqrt",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description: "Returns the square root of a nonnegative number.",
        args: [
          {
            name: "value",
            required: true,
            type: "number",
            repeat: false,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "int",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Returns the greatest integer that is less than or equal to the specified value.",
        args: [
          {
            name: "value",
            type: "number",
            required: true,
            repeat: false,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "parseNumber",
        category: "Arithmetic",
        subCategory: "FUNCTIONS",
        description:
          "Converts the text string to a number.Some exceptions apply—if the string contains certain mathematical operators(-,%) the result may not return as expected. In these scenarios we recommend using a combination of VALUE and REGEX_REPLACE to remove non-digit values from the string:VALUE(REGEX_REPLACE(YOURSTRING, `\\D`, ``))",
        args: [
          {
            name: "value",
            type: "string",
            required: true,
            repeat: false,
          },
        ],
        returnType: "number",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
    ],
    operators: [
      {
        value: "+",
        category: "Arithmetic",
        subCategory: "OPERATORS",
        description: "<div>Addition</div>",
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: "-",
        category: "Arithmetic",
        subCategory: "OPERATORS",
        description: "Subtraction",
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: "*",
        category: "Arithmetic",
        subCategory: "OPERATORS",
        description: "Multiplication",
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: "/",
        category: "Arithmetic",
        subCategory: "OPERATORS",
        description: "Division",
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      // {
      //   value: "%",
      //   category: "Arithmetic",
      //   subCategory: "OPERATORS",
      //   description: "Modulo",
      //   args: null,
      //   returnType: "",
      //   background: "#D9F8D4",
      //   example: "",
      //   group: "",
      // },
      {
        value: "^",
        category: "Arithmetic",
        subCategory: "OPERATORS",
        description: "Exponentiation",
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: "<",
        category: "Arithmetic",
        subCategory: "OPERATORS",
        description: "Less than",
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: ">",
        category: "Arithmetic",
        subCategory: "OPERATORS",
        description: "Greater than",
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: "<=",
        category: "Arithmetic",
        subCategory: "OPERATORS",
        description: "Less than or equal to",
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: ">=",
        category: "Arithmetic",
        subCategory: "OPERATORS",
        description: "Greater than or equal to",
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: "==",
        category: "Arithmetic",
        subCategory: "OPERATORS",
        description: "Equal to",
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: "!=",
        category: "Arithmetic",
        subCategory: "OPERATORS",
        description: "Not equal to",
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
    ],
    keywords: [],
  },
  {
    label: "Text & Binary",
    variables: [],
    functions: [
      // {
      //   value: "substring",
      //   category: "Text & Binary",
      //   subCategory: "FUNCTIONS",
      //   description: "Returns a concatenated string",
      //   args: [
      //     {
      //       name: "text",
      //       type: "string",
      //       required: true,
      //     },
      //     {
      //       name: "start",
      //       type: "number",
      //       required: false,
      //     },
      //     {
      //       name: "end",
      //       type: "number",
      //       required: false,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>substring(&quot;Hello&quot;, 0, 3)</p>\n        <p style="color: grey; fontSize: 11">=Hel</p>\n      </div>',
      //   group: "",
      // },
      {
        value: "concatenate",
        category: "Text & Binary",
        subCategory: "FUNCTIONS",
        description:
          "Joins together the text arguments into a single text value.To concatenate static text, surround it with double quotation marks. To concatenate double quotation marks, you need to use a backslash () as an escape character.Equivalent to use of the & operator.",
        args: [
          {
            name: "text1, [text2, ...]",
            type: "string",
            required: true,
          },
        ],
        returnType: "string",
        background: "#E5EAF1",
        example:
          '<div style="display:flex; color:#000;">\n        <p>concatenate("Bob"," - ", 43)</p>\n        <p style="color: grey; fontSize: 11">=Bob - 43</p>\n      </div>',
        group: "",
      },
      {
        value: "find",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>find("fox", "quick brown fox")</p>\n        <p style="color: grey; fontSize: 11">=13</p>\n      </div>',
        group: "",
      },
      {
        value: "search",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>search("World", "Hello World")</p>\n        <p style="color: grey; fontSize: 11">=7</p>\n      </div>',
        group: "",
      },
      {
        value: "trim",
        category: "Text & Binary",
        subCategory: "FUNCTIONS",
        description:
          "Removes whitespace at the beginning and end of the string.",
        args: [
          {
            name: "string",
            required: true,
            type: "string",
          },
        ],
        returnType: "string",
        background: "#E5EAF1",
        example:
          '<div style="display:flex; color:#000;">\n        <p>trim(" Hello! ")</p>\n        <p style="color: grey; fontSize: 11">=Hello!</p>\n      </div>',
        group: "",
      },
      {
        value: "len",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>len("quick brown fox")</p>\n        <p style="color: grey; fontSize: 11">=15</p>\n      </div>',
        group: "",
      },
      {
        value: "substitute",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>substitute("gold mold", "old", "et")</p>\n        <p style="color: grey; fontSize: 11">=get met</p>\n      </div>',
        group: "",
      },
      {
        value: "replace",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>replace("database", 2, 5, "o")</p>\n        <p style="color: grey; fontSize: 11">= dose</p>\n      </div>',
        group: "",
      },
      {
        value: "lower",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>lower("Hello!")</p>\n        <p style="color: grey; fontSize: 11">= hello!</p>\n      </div>',
        group: "",
      },
      {
        value: "upper",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>upper("Hello!")</p>\n        <p style="color: grey; fontSize: 11">= HELLO!</p>\n      </div>',
        group: "",
      },
      {
        value: "rept",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>rept("Hi! ", 3)</p>\n        <p style="color: grey; fontSize: 11">= Hi! Hi! Hi!</p>\n      </div>',
        group: "",
      },
      {
        value: "left",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>left("quick brown fox", 5)</p>\n        <p style="color: grey; fontSize: 11">= quick</p>\n      </div>',
        group: "",
      },
      {
        value: "mid",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>mid("quick brown fox", 6, 5)</p>\n        <p style="color: grey; fontSize: 11">= brown</p>\n      </div>',
        group: "",
      },
      {
        value: "right",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>right("quick brown fox", 5)</p>\n        <p style="color: grey; fontSize: 11">= n fox</p>\n      </div>',
        group: "",
      },
      {
        value: "encode",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>encode("chicken & waffles")</p>\n        <p style="color: grey; fontSize: 11">= chicken%20%26%20waffles</p>\n      </div>',
        group: "",
      },
      {
        value: "toBase64",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>toBase64("hello world")</p>\n        <p style="color: grey; fontSize: 11">="aGVsbG8gd29ybGQ="</p>\n      </div>',
        group: "",
      },
      {
        value: "fromBase64",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>fromBase64("aGVsbG8gd29ybGQ=")</p>\n        <p style="color: grey; fontSize: 11">="hello world"</p>\n      </div>',
        group: "",
      },
      {
        value: "regexMatch",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>regexmatch("Hello World", "Hello.World")</p>\n        <p style="color: grey; fontSize: 11">= 1</p>\n      </div>',
        group: "",
      },
      {
        value: "regexExtract",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>regexextract("Hello World", "W.*") </p>\n        <p style="color: grey; fontSize: 11">= "World"</p>\n      </div>',
        group: "",
      },
      {
        value: "regexReplace",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>regexreplace("Hello World", " W.*", "")</p>\n        <p style="color: grey; fontSize: 11">= "Hello"</p>\n      </div>',
        group: "",
      },
      {
        value: "split",
        category: "Text & Binary",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>split("apple,banana,cherry", ",", 2)</p>\n        <p style="color: grey; fontSize: 11">=["apple", "banana"]</p>\n      </div>',
        group: "",
      },
    ],
    operators: [],
    keywords: [
      {
        value: "",
        displayValue: "emptyString",
        category: "Text & Binary",
        subCategory: "KEYWORDS",
        description: `<div>Empty String ("")</div>`,
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: " ",
        displayValue: "space",
        category: "Text & Binary",
        subCategory: "KEYWORDS",
        description: `<div>Space (" ")</div>`,
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: "\n",
        displayValue: "newline",
        category: "Text & Binary",
        subCategory: "KEYWORDS",
        description: `Adds a new line.`,
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: "\t",
        displayValue: "tab",
        category: "Text & Binary",
        subCategory: "KEYWORDS",
        description: `Adds a tab.`,
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
    ],
  },
  {
    label: "Logical",
    variables: [],
    functions: [
      {
        value: "ifFn",
        displayValue: "if",
        category: "logical",
        subCategory: "FUNCTIONS",
        description:
          "Returns value1 if the logical expression is true, otherwise it returns value2. Can also be used to make nested IF statements.Can also be used to check if a cell is blank/is empty.",
        args: [
          {
            name: "expression",
            type: "boolean",
            required: true,
            repeat: false,
          },
          {
            name: "value1",
            type: "any",
            required: true,
            repeat: false,
          },
          {
            name: "value2",
            type: "any",
            required: true,
            repeat: false,
          },
        ],
        returnType: "any",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      // {
      //   value: "blank",
      //   category: "logical",
      //   subCategory: "FUNCTIONS",
      //   description: "Returns a blank value.",
      //   args: [
      //     {
      //       name: "",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      {
        value: "iserror",
        category: "logical",
        subCategory: "FUNCTIONS",
        description: "Returns true if the expression causes an error.",
        args: [
          {
            name: "expr",
            type: "any",
            required: true,
            repeat: false,
          },
        ],
        returnType: "boolean",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      // {
      //   value: "AND",
      //   displayValue: "and",
      //   category: "logical",
      //   subCategory: "OPERATORS",
      //   description:
      //     "Returns true if all the arguments are true, returns false otherwise.",
      //   args: [
      //     {
      //       name: "expr",
      //       required: false,
      //       repeat: true,
      //       type: "boolean",
      //     },
      //   ],
      //   returnType: "boolean",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      // {
      //   value: "OR",
      //   displayValue: "or",
      //   category: "logical",
      //   subCategory: "OPERATORS",
      //   description: "Returns true if any one of the arguments is true.",
      //   args: [
      //     {
      //       name: "expr",
      //       required: false,
      //       type: "boolean",
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "boolean",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
    ],
    operators: [
      {
        value: "AND",
        displayValue: "and",
        category: "logical",
        subCategory: "OPERATORS",
        description:
          "Returns true if all the arguments are true, returns false otherwise.",
        args: [
          {
            name: "expr",
            required: false,
            repeat: true,
            type: "boolean",
          },
        ],
        returnType: "boolean",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "OR",
        displayValue: "or",
        category: "logical",
        subCategory: "OPERATORS",
        description: "Returns true if any one of the arguments is true.",
        args: [
          {
            name: "expr",
            required: false,
            type: "boolean",
            repeat: true,
          },
        ],
        returnType: "boolean",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "NOT",
        displayValue: "not",
        category: "logical",
        subCategory: "OPERATORS",
        description: "Returns true if condition evaluates to false.",
        args: [
          {
            name: "expr",
            required: false,
            type: "boolean",
            repeat: true,
          },
        ],
        returnType: "boolean",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
    ],
    keywords: [
      {
        value: "TRUE",
        displayValue: "true",
        category: "Logical",
        subCategory: "KEYWORDS",
        description: `<div>true (boolean)</div>`,
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
      {
        value: "FALSE",
        displayValue: "false",
        category: "Logical",
        subCategory: "KEYWORDS",
        description: `<div>false (boolean)</div>`,
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
    ],
  },
  {
    label: "Date & Time",
    variables: [],
    // need to revisit this
    functions: [
      {
        value: "today",
        category: "Date & Time",
        subCategory: "FUNCTIONS",
        description:
          "Returns the current date (without time component), considering a specified time zone.",
        args: [
          {
            name: "tz_string",
            required: false,
            repeat: false,
            type: "string",
          },
        ],
        returnType: "Date",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "now",
        category: "Date & Time",
        subCategory: "FUNCTIONS",
        description:
          "Returns the current date and time, optionally considering a time zone.",
        args: [
          {
            name: "tz_string",
            required: false,
            repeat: false,
            type: "string",
          },
        ],
        returnType: "Date",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      // {
      //   value: "year",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description: "Returns the four-digit year of a datetime.",
      //   args: [
      //     {
      //       name: "date",
      //       type: "date",
      //       required: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>year("2021-06-09")</p>\n        <p style="color: grey; fontSize: 11">= 2021</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "month",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Returns the month of a datetime as a number between 1 (January) and 12 (December).",
      //   args: [
      //     {
      //       name: "date",
      //       type: "date",
      //       required: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>month("02/17/2013 7:31")</p>\n        <p style="color: grey; fontSize: 11">= 2</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "day",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Returns the day of the month of a datetime in the form of a number between 1-31.",
      //   args: [
      //     {
      //       name: "date",
      //       type: "date",
      //       required: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>day("02/17/2013")</p>\n        <p style="color: grey; fontSize: 11">= 17</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "hour",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Returns the hour of a datetime as a number between 0 (12:00am) and 23 (11:00pm).",
      //   args: [
      //     {
      //       name: "datetime",
      //       type: "date",
      //       required: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>hour("4 Mar 2017 7:00")</p>\n        <p style="color: grey; fontSize: 11">= 7</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "minute",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Returns the minute of a datetime as an integer between 0 and 59.",
      //   args: [
      //     {
      //       name: "datetime",
      //       type: "date",
      //       required: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>minute("02/17/2013 7:31")</p>\n        <p style="color: grey; fontSize: 11">= 31</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "second",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Returns the second of a datetime as an integer between 0 and 59.",
      //   args: [
      //     {
      //       name: "datetime",
      //       type: "date",
      //       required: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>second("02/17/2013 7:31:25")</p>\n        <p style="color: grey; fontSize: 11">= 25</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "dateadd",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Adds specified `count` units to a datetime. See the list of shared unit specifiers here. For this function we recommend using the full unit specifier, (i.e. use `years` instead of `y`), for your desired unit. ",
      //   args: [
      //     {
      //       name: "[date]; [#]; 'units'",
      //       required: true,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>dateadd("07/10/19", 10, "days")</p>\n        <p style="color: grey; fontSize: 11">= 2019-07-20</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "datediff",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Returns the difference between datetimes in specified units. The difference between datetimes is determined by subtracting [date2] from [date1]. This means that if [date2] is later than [date1], the resulting value will be negative. Default units are seconds. (See list of unit specifiers here.) NOTE 1: The DATETIME_DIFF()  formula will return whole integers for any unit specifier. NOTE 2: When attempting to use  DATETIME_DIFF() with static dates or dates that are formatted as strings you will want to nest the DATETIME_PARSE()",
      //   args: [
      //     {
      //       name: "[date1]; [date2]; 'units'",
      //       required: true,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>datediff("04/06/2019 12:00", "04/05/2019 11:00", "hours") </p>\n        <p style="color: grey; fontSize: 11">= 25</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "datestr",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description: "Formats a datetime into a string (YYYY-MM-DD). ",
      //   args: [
      //     {
      //       name: "date",
      //       required: true,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>datestr("12/13/21")</p>\n        <p style="color: grey; fontSize: 11">= 2021-12-13</p>\n      </div>',
      //   group: "",
      // },
      {
        value: "format",
        category: "Date & Time",
        subCategory: "FUNCTIONS",
        description:
          "Formats a given date into the specified output format, optionally considering a time zone.",
        args: [
          {
            name: "date",
            required: true,
            repeat: false,
            type: "Date",
          },
          {
            name: "out_format",
            required: true,
            repeat: false,
            type: "string",
          },
          {
            name: "tz_string",
            required: false,
            repeat: false,
            type: "string",
          },
        ],
        returnType: "string",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: "parse",
        category: "Date & Time",
        subCategory: "FUNCTIONS",
        description:
          "Parses a date string according to the specified source format, optionally considering a time zone.",
        args: [
          {
            name: "date_str",
            type: "string",
            required: true,
            repeat: false,
          },
          {
            name: "src_format",
            type: "string",
            required: true,
            repeat: false,
          },
          {
            name: "tz_string",
            type: "string",
            required: false,
            repeat: false,
          },
        ],
        returnType: "Date",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      // {
      //   value: "isafter",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Determines if [date1] is later than [date2]. Returns 1 if yes, 0 if no.",
      //   args: [
      //     {
      //       name: "[date1]; [date2]",
      //       required: true,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>isafter("1/1/1979", "1/1/2000")</p>\n        <p style="color: grey; fontSize: 11">= 0</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "isbefore",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Determines if [date1] is earlier than [date2]. Returns 1 if yes, 0 if no.",
      //   args: [
      //     {
      //       name: "[date1]; [date2]",
      //       required: true,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>isbefore("1/1/1979", "1/1/2000")</p>\n        <p style="color: grey; fontSize: 11">= 1</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "issame",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Compares two dates up to a unit and determines whether they are identical. Returns 1 if yes, 0 if no.",
      //   args: [
      //     {
      //       name: "[date1]; [date2]; [unit]",
      //       required: true,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>issame("1/1/1979", "1/1/1979")</p>\n        <p style="color: grey; fontSize: 11">= 1</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "setlocale",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Sets a specific locale for a datetime. Must be used in conjunction with datetimeformat. A list of supported locale modifiers can be found here.",
      //   args: [
      //     {
      //       name: "[date]; [locale_modifier]",
      //       required: true,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>datetimeformat(setlocale("07/10/19", "es"), "LLLL")</p>\n        <p style="color: grey; fontSize: 11">= miércoles, 10 de julio de 2019 0:00</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "settimezone",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Sets a specific timezone for a datetime. Must be used in conjunction with datetimeformat. A list of supported timezone identifiers can be found here.",
      //   args: [
      //     {
      //       name: "[date]; [tz_identifier]",
      //       required: true,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>datetimeformat(settimezone("07/10/19 13:00", "Australia/Sydney"), "M/D/YYYY h:mm")</p>\n        <p style="color: grey; fontSize: 11">= 7/10/2019 11:00</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "timestr",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description: "Formats a datetime into a time-only string (HH:mm:ss).",
      //   args: [
      //     {
      //       name: "[date/timestamp]",
      //       required: true,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>timestr("02/17/2013 7:31:25")</p>\n        <p style="color: grey; fontSize: 11">= 7:31:25</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "tonow",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Calculates the number of days between the current date and another date.",
      //   args: [
      //     {
      //       name: "[date]) &  FROMNOW([date]",
      //       required: true,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>tonow({Date})</p>\n        <p style="color: grey; fontSize: 11">= 25 days</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "weekday",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Returns the day of the week as an integer between 0 and 6, inclusive. You may optionally provide a second argument (either `Sunday` or `Monday`) to start weeks on that day. If omitted, weeks start on Sunday by default. Example:WEEKDAY(TODAY(), `Monday`)",
      //   args: [
      //     {
      //       name: "date; [startDayOfWeek]",
      //       required: true,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>weekday("2021-06-09")</p>\n        <p style="color: grey; fontSize: 11">= 3 (for Wednesday)</p>\n      </div>',
      //   group: "",
      // },
      // {
      //   value: "weeknum",
      //   category: "Date & Time",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Returns the week number in a year. You may optionally provide a second argument (either `Sunday` or `Monday`) to start weeks on that day. If omitted, weeks start on Sunday by default. Example:WEEKNUM(TODAY(), `Monday`)",
      //   args: [
      //     {
      //       name: "date; [startDayOfWeek]",
      //       required: true,
      //     },
      //   ],
      //   returnType: "string",
      //   background: "#E5EAF1",
      //   example:
      //     '<div style="display:flex; color:#000;">\n        <p>weeknum("02/17/2013")  </p>\n        <p style="color: grey; fontSize: 11">= 8</p>\n      </div>',
      //   group: "",
      // },
    ],
    operators: [],
    keywords: [],
  },
  {
    label: "Array",
    variables: [],
    functions: [
      // {
      //   value: "add",
      //   category: "Array",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Adds values specified in parameters to an array and returns that array.",
      //   args: [
      //     {
      //       name: "array; value1; value2; ...",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      // {
      //   value: "contains",
      //   category: "Array",
      //   subCategory: "FUNCTIONS",
      //   description: "Verifies if an array contains the value.",
      //   args: [
      //     {
      //       name: "array; value",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      {
        value: "getValueAt",
        category: "Array",
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
      },
      {
        value: "size",
        category: "Array",
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
      },
      {
        value: "arrayToJson",
        category: "Array",
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
      },
      {
        value: "getValuesByKey",
        category: "Array",
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
      },
      {
        value: "uniq",
        category: "Array",
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
      },
      {
        value: "join",
        category: "Array",
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
      },
      {
        value: "slice",
        category: "Array",
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
        example:
          '<div style="display:flex; color:#000;">\n        <p>slice([1, 2, 3, 4, 5], 1, 3)</p>\n        <p style="color: grey; fontSize: 11">=[2, 3]</p>\n      </div>',
        group: "",
      },
      {
        value: "modifyArray",
        category: "Array",
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
        example:
          "<div style=\"display:flex; color:#000;\">\n        <p>splice([1, 2, 3, 4, 5], 1, 2, 'a', 'b')</p>\n        <p style=\"color: grey; fontSize: 11\">=[1, 'a', 'b', 4, 5]</p>\n      </div>",
        group: "",
      },

      // {
      //   value: "merge",
      //   category: "Array",
      //   subCategory: "FUNCTIONS",
      //   description: "Merges two or more arrays into one array",
      //   args: [
      //     {
      //       name: "array1; array2; ...",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      // {
      //   value: "remove",
      //   category: "Array",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Removes values specified in the parameters of an array. Effective only in case of primitive arrays of text or numbers.",
      //   args: [
      //     {
      //       name: "array; value1; value2; ...",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      // {
      //   value: "reverse",
      //   category: "Array",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "The first element of the array becomes the last element and vice versa.",
      //   args: [
      //     {
      //       name: "array",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      // {
      //   value: "slice",
      //   category: "Array",
      //   subCategory: "FUNCTIONS",
      //   description: "Returns a new array containing only selected items.",
      //   args: [
      //     {
      //       name: "array; start; [end]",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      // {
      //   value: "sort",
      //   category: "Array",
      //   subCategory: "FUNCTIONS",
      //   description: "Sorts values of an array. The valid values of the order.",
      //   args: [
      //     {
      //       name: "array; [order]; [key]",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      // {
      //   value: "compact",
      //   category: "Array",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Removes empty strings and null values from the array. Keeps false and strings that contain one or more blank characters.",
      //   args: [
      //     {
      //       name: "values",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      // {
      //   value: "flatten",
      //   category: "Array",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Flattens the array by removing any array nesting. All items become elements of a single array.",
      //   args: [
      //     {
      //       name: "values",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      // {
      //   value: "join",
      //   category: "Array",
      //   subCategory: "FUNCTIONS",
      //   description:
      //     "Join the array of rollup items into a string with a separator.",
      //   args: [
      //     {
      //       name: "values; separator",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
      // {
      //   value: "unique",
      //   category: "Array",
      //   subCategory: "FUNCTIONS",
      //   description: "Returns only unique items in the array.",
      //   args: [
      //     {
      //       name: "values",
      //       required: false,
      //       repeat: true,
      //     },
      //   ],
      //   returnType: "number",
      //   background: "#E5EAF1",
      //   example: "",
      //   group: "",
      // },
    ],
    operators: [],
    keywords: [],
  },
  {
    label: "Other",
    variables: [],
    functions: [
      {
        value: "isEmpty",
        category: "other",
        subCategory: "FUNCTIONS",
        description:
          "Returns true if value in the parameter is empty, null, {}, [] or undefined and false otherwise.",
        args: [
          {
            name: "value",
          },
        ],
        returnType: "boolean",
        background: "#E5EAF1",
        example:
          '<div style="display:flex; color:#000;">\n        <p>isEmpty("")</p>\n        <p style="color: grey; fontSize: 11"> = true</p>\n      </div>',
        group: "",
      },
      {
        value: "isEmptyOrNull",
        category: "other",
        subCategory: "FUNCTIONS",
        description:
          "Returns true if value in the parameter is empty, null or undefined and false otherwise.",
        args: [
          {
            name: "value",
          },
        ],
        returnType: "boolean",
        background: "#E5EAF1",
        example:
          '<div style="display:flex; color:#000;">\n        <p>isEmptyOrNull(null)</p>\n        <p style="color: grey; fontSize: 11"> = true</p>\n      </div>',
        group: "",
      },
      {
        value: "isNotEmpty",
        category: "other",
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
        background: "#E5EAF1",
        example:
          '<div style="display:flex; color:#000;">\n        <p>isNotEmpty("OUTE")</p>\n        <p style="color: grey; fontSize: 11"> = true</p>\n      </div>',
        group: "",
      },
      {
        value: "isNotEmptyOrNull",
        category: "other",
        subCategory: "FUNCTIONS",
        description:
          "Returns true if value in the parameter is not empty, null or undefined and false otherwise.",
        args: [
          {
            name: "value",
          },
        ],
        returnType: "boolean",
        background: "#E5EAF1",
        example:
          '<div style="display:flex; color:#000;">\n        <p>isNotEmptyOrNull("OUTE")</p>\n        <p style="color: grey; fontSize: 11"> = true</p>\n      </div>',
        group: "",
      },
      {
        value: "isValueExists",
        category: "other",
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
        background: "#E5EAF1",
        example:
          '<div style="display:flex; color:#000; flex-direction: column;">\n        <div style="display:flex; color:#000;"><p>isValueExits("OUTE","O")</p>\n        <p style="color: grey; fontSize: 11"> = true</p></div>\n  <div style="display:flex; color:#000;"><p>isValueExits(["OUTE"],"OUTE")</p>\n        <p style="color: grey; fontSize: 11"> = true</p></div>\n    </div>',
        group: "",
      },
      {
        value: "merge",
        category: "other",
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
        background: "#E5EAF1",
        example:
          '<div style="display:flex; color:#000;">\n        <p>merge({month : 1}, {year: 2021})</p>\n        <p style="color: grey; fontSize: 11">= { month: 1, year: 2021 }</p>\n      </div>',
        group: "",
      },
      {
        value: "toObject",
        category: "other",
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
        background: "#E5EAF1",
        example:
          '<div style="display:flex; color:#000;">\n        <p>toObject("{\\"name\\": \\"John\\"}")</p>\n        <p style="color: grey; fontSize: 11">={ name: \'John\'}</p>\n      </div>',
        group: "",
      },
      {
        value: "toStringify",
        category: "other",
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
        background: "#E5EAF1",
        example:
          '<div style="display:flex; color:#000;">\n        <p>toStringify({ name: \'John\'})</p>\n        <p style="color: grey; fontSize: 11">="{\\"name\\":\\"John\\"}"</p>\n      </div>',
        group: "",
      },
      {
        value: "getValueByPath",
        category: "other",
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
        background: "#E5EAF1",
        example:
          "<div style=\"display:flex; color:#000;\">\n<p>getValueByPath({ name: { first: 'John' } }, 'name.first')</p>\n        <p style=\"color: grey; fontSize: 11\">='John'</p>\n      </div>",
        group: "",
      },
      {
        value: "getKeys",
        category: "other",
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
        background: "#E5EAF1",
        example:
          "<div style=\"display:flex; color:#000;\">\n        <p>getKeys({ name: 'John', age: 30 })</p>\n        <p style=\"color: grey; fontSize: 11\">=['name', 'age']</p>\n      </div>",
        group: "",
      },
      {
        value: "getValues",
        category: "other",
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
        background: "#E5EAF1",
        example:
          "<div style=\"display:flex; color:#000;\">\n        <p>getValues({ name: 'John', age: 30 })</p>\n        <p style=\"color: grey; fontSize: 11\">=['John', 30]</p>\n      </div>",
        group: "",
      },
    ],
    operators: [
      {
        value: "(",
        category: "Other",
        subCategory: "OPERATORS",
        description: "Opening Bracket",
        args: null,
        returnType: "",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: ")",
        category: "Other",
        subCategory: "OPERATORS",
        description: "Closing Bracket",
        args: null,
        returnType: "",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
      {
        value: ",",
        category: "Other",
        subCategory: "OPERATORS",
        description: "Argument separator",
        args: null,
        returnType: "",
        background: "#E5EAF1",
        example: "",
        group: "",
      },
    ],
    keywords: [
      {
        value: null,
        displayValue: "null",
        category: "Other",
        subCategory: "KEYWORDS",
        description: `<div>Null (null)</div>`,
        args: null,
        returnType: "",
        background: "#D9F8D4",
        example: "",
        group: "",
      },
    ],
  },
];
