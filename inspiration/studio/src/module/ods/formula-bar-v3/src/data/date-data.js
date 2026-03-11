import { DATE_AND_TIME } from "../constants/categories";
import { FUNCTIONS, KEYWORDS, OPERATORS, VARIABLES } from "../constants/types";
import { blockStyle } from "./common-styles";

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
    // {
    //   value: "year",
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    // {
    //   value: "isafter",
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    //   category: DATE_AND_TIME,
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
    <p><span style=${blockStyle}>addSeconds(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>,</span>60<span style=${blockStyle}>)</span></p>
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
    <p ><span style=${blockStyle}>addMinutes(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>,</span>60<span style=${blockStyle}>)</span></p>
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
    <p><span style=${blockStyle}>addHours(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>,</span>2<span style=${blockStyle}>)</span></p>
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
      <p><span style=${blockStyle}>addDays(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>,</span>7<span style=${blockStyle}>)</span></p>
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
      <p><span style=${blockStyle}>addMonths(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>,</span>3<span style=${blockStyle}>)</span></p>
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
      <p><span style=${blockStyle}>addYears(</span>2024-09-19T06:48:03.540Z<span style=${blockStyle}>,</span>1<span style=${blockStyle}>)</span></p>
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
