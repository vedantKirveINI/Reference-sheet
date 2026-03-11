import { ARITHMETIC } from '../constants/categories';
import { FUNCTIONS, KEYWORDS, OPERATORS, VARIABLES } from '../constants/types';

export const arithmeticData = {
  [VARIABLES]: [],
  [FUNCTIONS]: [
    {
      value: "average",
      category: ARITHMETIC,
      subCategory: "FUNCTIONS",
      description:
        "Returns the average value for a set of numeric values within an array or when numeric values are entered individually.",
      args: [
        {
          name: "value1, value2, ...",
          required: true,
          type: "number",
          repeat: true,
        },
      ],
      returnType: "number",
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "average(10, 20, 30)",
          result: "20"
        },
        {
          formula: "average(5, 15, 25, 35, 45)",
          result: "25"
        }
      ],
      group: "",
      applicableFor: ["all", "tables"],
    },
    {
      value: "sum",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "sum(10, 20, 30)",
          result: "60"
        },
        {
          formula: "sum(5, 15, 25, 35)",
          result: "80"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "min",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "min(10, 20, 5, 30)",
          result: "5"
        },
        {
          formula: "min(100, 50, 75)",
          result: "50"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "max",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "max(10, 20, 5, 30)",
          result: "30"
        },
        {
          formula: "max(100, 50, 75)",
          result: "100"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "floor",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "floor(7.8)",
          result: "7"
        },
        {
          formula: "floor(15.3, 5)",
          result: "15"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "ceiling",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "ceiling(7.2)",
          result: "8"
        },
        {
          formula: "ceiling(15.3, 5)",
          result: "20"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "even",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "even(7)",
          result: "8"
        },
        {
          formula: "even(10)",
          result: "10"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "odd",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "odd(8)",
          result: "9"
        },
        {
          formula: "odd(11)",
          result: "11"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "round",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "round(7.8)",
          result: "8"
        },
        {
          formula: "round(3.14159, 2)",
          result: "3.14"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "roundDown",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "roundDown(7.8, 0)",
          result: "7"
        },
        {
          formula: "roundDown(3.14159, 2)",
          result: "3.14"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "roundUp",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "roundUp(7.2, 0)",
          result: "8"
        },
        {
          formula: "roundUp(3.14159, 2)",
          result: "3.15"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "count",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "count(10, 20, 30)",
          result: "3"
        },
        {
          formula: "count(5, 15, 25, 35, 45)",
          result: "5"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "countA",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "countA(10, \"text\", 30)",
          result: "3"
        },
        {
          formula: "countA(\"a\", \"b\", \"c\")",
          result: "3"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "abs",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "abs(-10)",
          result: "10"
        },
        {
          formula: "abs(15)",
          result: "15"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "exp",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "exp(1)",
          result: "2.718281828459045"
        },
        {
          formula: "exp(2)",
          result: "7.38905609893065"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "log",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "log(100)",
          result: "2"
        },
        {
          formula: "log(8, 2)",
          result: "3"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "sqrt",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "sqrt(16)",
          result: "4"
        },
        {
          formula: "sqrt(25)",
          result: "5"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "int",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "int(7.8)",
          result: "7"
        },
        {
          formula: "int(-3.2)",
          result: "-4"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "parseNumber",
      category: ARITHMETIC,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "parseNumber(123)",
          result: "123"
        },
        {
          formula: "parseNumber(45.67)",
          result: "45.67"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "random",
      category: ARITHMETIC,
      subCategory: "FUNCTIONS",
      module_name: "lodash",
      description:
        "Generates a random numberProduces a random number between the inclusive lower and upper bounds. If only one argument is provided a number between 0 and the given number is returned. If floating is true, or either lower or upper are floats, a floating-point number is returned instead of an integer.",
      args: [
        {
          name: "lower",
          type: "string",
          required: true,
          repeat: false,
        },
        {
          name: "upper",
          type: "string",
          required: false,
          repeat: false,
        },
        {
          name: "floating",
          type: "boolean",
          required: false,
          repeat: false,
        },
      ],
      returnType: "number",
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "random(1, 10)",
          result: "5"
        },
        {
          formula: "random(0, 100)",
          result: "42"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
  ],
  [OPERATORS]: [
    {
      value: "+",
      category: ARITHMETIC,
      subCategory: "OPERATORS",
      description: "<div>Addition</div>",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all", "tables"],
    },
    {
      value: "-",
      category: ARITHMETIC,
      subCategory: "OPERATORS",
      description: "Subtraction",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all", "tables"],
    },
    {
      value: "*",
      category: ARITHMETIC,
      subCategory: "OPERATORS",
      description: "Multiplication",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all", "tables"],
    },
    {
      value: "/",
      category: ARITHMETIC,
      subCategory: "OPERATORS",
      description: "Division",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all", "tables"],
    },
    // {
    //   value: "^",
    //   category: ARITHMETIC,
    //   subCategory: "OPERATORS",
    //   description: "Exponentiation",
    //   args: null,
    //   returnType: "",
    //   background: "#F3F4F6",
    //   example: "",
    //   group: "",
    //   applicableFor: ["all"],
    // },
    {
      value: "<",
      category: ARITHMETIC,
      subCategory: "OPERATORS",
      description: "Less than",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: ">",
      category: ARITHMETIC,
      subCategory: "OPERATORS",
      description: "Greater than",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "<=",
      category: ARITHMETIC,
      subCategory: "OPERATORS",
      description: "Less than or equal to",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: ">=",
      category: ARITHMETIC,
      subCategory: "OPERATORS",
      description: "Greater than or equal to",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "==",
      category: ARITHMETIC,
      subCategory: "OPERATORS",
      description: "Equal to",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "!=",
      category: ARITHMETIC,
      subCategory: "OPERATORS",
      description: "Not equal to",
      args: null,
      returnType: "",
      background: "#F3F4F6",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
  ],
  [KEYWORDS]: [],
};
