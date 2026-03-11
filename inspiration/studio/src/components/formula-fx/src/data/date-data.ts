import { DATE_AND_TIME } from '../constants/categories';
import { FUNCTIONS, KEYWORDS, OPERATORS, VARIABLES } from '../constants/types';
import { blockStyle } from './common-styles';

export const dateData = {
  [VARIABLES]: [],
  // need to revisit this
  [FUNCTIONS]: [
    {
      value: "today",
      category: DATE_AND_TIME,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "today()",
          result: "2026-03-02"
        },
        {
          formula: "today(America/New_York)",
          result: "2026-03-02"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "now",
      category: DATE_AND_TIME,
      subCategory: "FUNCTIONS",
      description:
        "Returns the current date and time as an ISO string.",
      args: [],
      returnType: "Date",
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "now()",
          result: "2026-02-23T07:50:42.462Z"
        },
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "format",
      category: DATE_AND_TIME,
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "format(now(), \"YYYY-MM-DD\")",
          result: "\"2026-01-13\""
        },
        {
          formula: "format(now(), \"MM/DD/YYYY HH:mm\")",
          result: "\"01/13/2026 18:15\""
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "parse",
      category: DATE_AND_TIME,
      subCategory: "FUNCTIONS",
      description:
        "Parses a date string according to the specified source format and returns it as an ISO string. Optionally accepts a time zone string.",
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
      background: "#F3F4F6",
      example: "",
      examples: [
        {
          formula: "parse(\"2026-01-13\", \"YYYY-MM-DD\")",
          result: "2026-01-13T00:00:00.000Z"
        },
        {
          formula: "parse(\"01/13/2026\", \"MM/DD/YYYY\")",
          result: "2026-01-13T00:00:00.000Z"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "addSeconds",
      displayValue: "addSeconds",
      category: DATE_AND_TIME,
      subCategory: "FUNCTIONS",
      description:
        "Returns a new date with the specified number of seconds added.",
      args: [
        {
          name: "date",
          type: "string",
          required: true,
          description: "The date to add seconds to",
        },
        {
          name: "seconds",
          type: "number",
          required: true,
          description: "The number of seconds to add",
        },
      ],
      returnType: "Date",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">
    <p><span style=${blockStyle}>addSeconds(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>,</span>60<span style=${blockStyle}>)</span></p>
    <p style="color: grey; fontSize: 11">=2024-09-19T06:49:03.540Z</p>
  </div>`,
      examples: [
        {
          formula: "addSeconds(now(), 60)",
          result: "@January 13, 2026 6:16 PM"
        },
        {
          formula: "addSeconds(2024-09-19T06:48:03.540Z, 30)",
          result: "2024-09-19T06:48:33.540Z"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "addMinutes",
      displayValue: "addMinutes",
      category: DATE_AND_TIME,
      subCategory: "FUNCTIONS",
      description:
        "Returns a new date with the specified number of minutes added.",
      args: [
        {
          name: "date",
          type: "string",
          required: true,
          description: "The date to add minutes to",
        },
        {
          name: "minutes",
          type: "number",
          required: true,
          description: "The number of minutes to add",
        },
      ],
      returnType: "Date",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">
    <p ><span style=${blockStyle}>addMinutes(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>,</span>60<span style=${blockStyle}>)</span></p>
    <p style="color: grey; fontSize: 11">=2024-09-19T07:48:03.540Z</p>
  </div>`,
      examples: [
        {
          formula: "addMinutes(now(), 30)",
          result: "@January 13, 2026 6:45 PM"
        },
        {
          formula: "addMinutes(2024-09-19T06:48:03.540Z, 60)",
          result: "2024-09-19T07:48:03.540Z"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "addHours",
      displayValue: "addHours",
      category: DATE_AND_TIME,
      subCategory: "FUNCTIONS",
      description:
        "Returns a new date with the specified number of hours added.",
      args: [
        {
          name: "date",
          type: "string",
          required: true,
          description: "The date to add hours to",
        },
        {
          name: "hours",
          type: "number",
          required: true,
          description: "The number of hours to add",
        },
      ],
      returnType: "Date",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">
    <p><span style=${blockStyle}>addHours(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>,</span>2<span style=${blockStyle}>)</span></p>
    <p style="color: grey; fontSize: 11">=2024-09-19T08:48:03.540Z</p>
  </div>`,
      examples: [
        {
          formula: "addHours(now(), 2)",
          result: "@January 13, 2026 8:15 PM"
        },
        {
          formula: "addHours(2024-09-19T06:48:03.540Z, 12)",
          result: "2024-09-19T18:48:03.540Z"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "addDays",
      displayValue: "addDays",
      category: DATE_AND_TIME,
      subCategory: "FUNCTIONS",
      description:
        "Returns a new date with the specified number of days added.",
      args: [
        {
          name: "date",
          type: "string",
          required: true,
          description: "The date to add days to",
        },
        {
          name: "days",
          type: "number",
          required: true,
          description: "The number of days to add",
        },
      ],
      returnType: "Date",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">
      <p><span style=${blockStyle}>addDays(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>,</span>7<span style=${blockStyle}>)</span></p>
      <p style="color: grey; fontSize: 11">=2024-09-26T06:48:03.540Z</p>
    </div>`,
      examples: [
        {
          formula: "addDays(now(), 1)",
          result: "@January 14, 2026 6:15 PM"
        },
        {
          formula: "addDays(2024-09-19T06:48:03.540Z, 7)",
          result: "2024-09-26T06:48:03.540Z"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "addMonths",
      displayValue: "addMonths",
      category: DATE_AND_TIME,
      subCategory: "FUNCTIONS",
      description:
        "Returns a new date with the specified number of months added.",
      args: [
        {
          name: "date",
          type: "string",
          required: true,
          description: "The date to add months to",
        },
        {
          name: "months",
          type: "number",
          required: true,
          description: "The number of months to add",
        },
      ],
      returnType: "Date",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">
      <p><span style=${blockStyle}>addMonths(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>,</span>3<span style=${blockStyle}>)</span></p>
      <p style="color: grey; fontSize: 11">=2024-12-19T06:48:03.540Z</p>
    </div>`,
      examples: [
        {
          formula: "addMonths(now(), 2)",
          result: "@March 13, 2026 6:15 PM"
        },
        {
          formula: "addMonths(2024-09-19T06:48:03.540Z, 3)",
          result: "2024-12-19T06:48:03.540Z"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "addYears",
      displayValue: "addYears",
      category: DATE_AND_TIME,
      subCategory: "FUNCTIONS",
      description:
        "Returns a new date with the specified number of years added.",
      args: [
        {
          name: "date",
          type: "string",
          required: true,
          description: "The date to add years to",
        },
        {
          name: "years",
          type: "number",
          required: true,
          description: "The number of years to add",
        },
      ],
      returnType: "Date",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">
      <p><span style=${blockStyle}>addYears(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>,</span>1<span style=${blockStyle}>)</span></p>
      <p style="color: grey; fontSize: 11">=2025-09-19T06:48:03.540Z</p>
    </div>`,
      examples: [
        {
          formula: "addYears(now(), 3)",
          result: "@January 13, 2029 6:15 PM"
        },
        {
          formula: "addYears(2024-09-19T06:48:03.540Z, 1)",
          result: "2025-09-19T06:48:03.540Z"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "dateToUnixSeconds",
      displayValue: "dateToUnixSeconds",
      category: DATE_AND_TIME,
      subCategory: "FUNCTIONS",
      description: "Converts a date to Unix timestamp in seconds.",
      args: [
        {
          name: "date",
          type: "string",
          required: true,
          description: "The date to convert to Unix timestamp",
        },
      ],
      returnType: "number",
      background: "#F3F4F6",
      example: `<div style="display:flex; color:#000;">
        <p><span style=${blockStyle}>dateToUnixSeconds(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>)</span></p>
        <p style="color: grey; fontSize: 11">=1726735683</p>
      </div>`,
      examples: [
        {
          formula: "dateToUnixSeconds(now())",
          result: "1726265700"
        },
        {
          formula: "dateToUnixSeconds(\"2024-09-19T06:48:03.540Z\") ",
          result: "1726735683"
        }
      ],
      group: "",
      applicableFor: ["all"],
    },
  ],
  [OPERATORS]: [],
  [KEYWORDS]: [],
};






