import { DATE_AND_TIME } from '../constants/categories.ts';
import { FUNCTIONS, KEYWORDS, OPERATORS, VARIABLES } from '../constants/types.ts';
import { blockStyle } from './common-styles.ts';

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
      background: "#E5EAF1",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "now",
      category: DATE_AND_TIME,
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
      background: "#E5EAF1",
      example: "",
      group: "",
      applicableFor: ["all"],
    },
    {
      value: "parse",
      category: DATE_AND_TIME,
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
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">
    <p><span style=${blockStyle}>addSeconds(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>;</span>60<span style=${blockStyle}>)</span></p>
    <p style="color: grey; fontSize: 11">=2024-09-19T06:49:03.540Z</p>
  </div>`,
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
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">
    <p ><span style=${blockStyle}>addMinutes(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>;</span>60<span style=${blockStyle}>)</span></p>
    <p style="color: grey; fontSize: 11">=2024-09-19T07:48:03.540Z</p>
  </div>`,
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
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">
    <p><span style=${blockStyle}>addHours(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>;</span>2<span style=${blockStyle}>)</span></p>
    <p style="color: grey; fontSize: 11">=2024-09-19T08:48:03.540Z</p>
  </div>`,
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
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">
      <p><span style=${blockStyle}>addDays(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>;</span>7<span style=${blockStyle}>)</span></p>
      <p style="color: grey; fontSize: 11">=2024-09-26T06:48:03.540Z</p>
    </div>`,
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
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">
      <p><span style=${blockStyle}>addMonths(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>;</span>3<span style=${blockStyle}>)</span></p>
      <p style="color: grey; fontSize: 11">=2024-12-19T06:48:03.540Z</p>
    </div>`,
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
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">
      <p><span style=${blockStyle}>addYears(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>;</span>1<span style=${blockStyle}>)</span></p>
      <p style="color: grey; fontSize: 11">=2025-09-19T06:48:03.540Z</p>
    </div>`,
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
      background: "#E5EAF1",
      example: `<div style="display:flex; color:#000;">
        <p><span style=${blockStyle}>dateToUnixSeconds(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>)</span></p>
        <p style="color: grey; fontSize: 11">=1726735683</p>
      </div>`,
      group: "",
      applicableFor: ["all"],
    },
  ],
  [OPERATORS]: [],
  [KEYWORDS]: [],
};






