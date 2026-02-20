import { CellType, ICell, IColumn, IRecord, IRowHeader, ITableData, RowHeightLevel } from "@/types";

const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
  "Thomas", "Sarah", "Christopher", "Karen", "Charles", "Lisa", "Daniel", "Nancy",
  "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
  "Steven", "Kimberly", "Paul", "Emily", "Andrew", "Donna", "Joshua", "Michelle",
  "Kenneth", "Carol", "Kevin", "Amanda", "Brian", "Dorothy", "George", "Melissa",
  "Timothy", "Deborah",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
  "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts",
];

const NOTES = [
  "Follow up next week regarding project timeline",
  "Excellent performance in Q4 review",
  "Needs additional training on new system",
  "Requested transfer to remote position",
  "Leading the new product initiative",
  "Scheduled for promotion review in March",
  "Completed advanced certification program",
  "Key contributor to client retention efforts",
  "Mentoring two junior team members",
  "Proposed cost-saving measures for department",
  "Attending industry conference next month",
  "Working on cross-functional collaboration project",
  "Recently relocated from another office",
  "Specializes in data analytics and reporting",
  "Contributing to open-source company projects",
  "",
  "",
  "",
];

const CITIES = [
  { city: "San Francisco", state: "CA" },
  { city: "New York", state: "NY" },
  { city: "Austin", state: "TX" },
  { city: "Seattle", state: "WA" },
  { city: "Chicago", state: "IL" },
  { city: "Boston", state: "MA" },
  { city: "Denver", state: "CO" },
  { city: "Portland", state: "OR" },
  { city: "Miami", state: "FL" },
  { city: "Los Angeles", state: "CA" },
  { city: "Atlanta", state: "GA" },
  { city: "Nashville", state: "TN" },
];

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function formatDateDisplay(date: Date): string {
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
}

function formatDateTimeDisplay(date: Date): string {
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  const minuteStr = minutes < 10 ? `0${minutes}` : String(minutes);
  return `${month} ${day}, ${year} ${hours}:${minuteStr} ${meridiem}`;
}

export function generateMockColumns(): IColumn[] {
  return [
    { id: "col_name", name: "Name", type: CellType.String, width: 200 },
    { id: "col_email", name: "Email", type: CellType.String, width: 220 },
    { id: "col_age", name: "Age", type: CellType.Number, width: 100 },
    { id: "col_status", name: "Status", type: CellType.SCQ, width: 140, options: { options: ["Active", "Inactive", "Pending"] } as any },
    { id: "col_tags", name: "Tags", type: CellType.MCQ, width: 180, options: { options: ["Engineering", "Design", "Marketing", "Sales", "Support"] } as any },
    { id: "col_priority", name: "Priority", type: CellType.DropDown, width: 130, options: { options: ["High", "Medium", "Low"] } as any },
    { id: "col_verified", name: "Verified", type: CellType.YesNo, width: 110 },
    { id: "col_salary", name: "Salary", type: CellType.Number, width: 120 },
    { id: "col_department", name: "Department", type: CellType.SCQ, width: 150, options: { options: ["Engineering", "Design", "Marketing", "Sales", "HR", "Finance"] } as any },
    { id: "col_notes", name: "Notes", type: CellType.String, width: 250 },
    { id: "col_start_date", name: "Start Date", type: CellType.DateTime, width: 160 },
    { id: "col_phone", name: "Phone", type: CellType.PhoneNumber, width: 160 },
    { id: "col_currency", name: "Budget", type: CellType.Currency, width: 130 },
    { id: "col_address", name: "Office", type: CellType.Address, width: 200 },
    { id: "col_rating", name: "Rating", type: CellType.Rating, width: 130 },
    { id: "col_slider", name: "Progress", type: CellType.Slider, width: 140 },
    { id: "col_time", name: "Check-in", type: CellType.Time, width: 120 },
    { id: "col_created", name: "Created", type: CellType.CreatedTime, width: 170 },
  ];
}

function generateCellForColumn(column: IColumn, rand: () => number): ICell {
  const opts = (column.options as any)?.options as string[] | undefined;

  switch (column.type) {
    case CellType.String: {
      if (column.id === "col_name") {
        const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
        const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
        const name = `${first} ${last}`;
        return { type: CellType.String, data: name, displayData: name };
      }
      if (column.id === "col_email") {
        const first = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)].toLowerCase();
        const last = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)].toLowerCase();
        const domains = ["gmail.com", "outlook.com", "company.io", "work.co", "email.com"];
        const domain = domains[Math.floor(rand() * domains.length)];
        const email = `${first}.${last}@${domain}`;
        return { type: CellType.String, data: email, displayData: email };
      }
      if (column.id === "col_notes") {
        const note = NOTES[Math.floor(rand() * NOTES.length)];
        return { type: CellType.String, data: note, displayData: note };
      }
      const val = "Text";
      return { type: CellType.String, data: val, displayData: val };
    }

    case CellType.Number: {
      if (column.id === "col_age") {
        const age = Math.floor(rand() * 44) + 22;
        return { type: CellType.Number, data: age, displayData: String(age) };
      }
      if (column.id === "col_salary") {
        const salary = Math.floor(rand() * 160000 / 1000) * 1000 + 40000;
        return { type: CellType.Number, data: salary, displayData: salary.toLocaleString("en-US") };
      }
      const num = Math.floor(rand() * 100);
      return { type: CellType.Number, data: num, displayData: String(num) };
    }

    case CellType.SCQ: {
      const options = opts || ["Option 1"];
      const selected = options[Math.floor(rand() * options.length)];
      return { type: CellType.SCQ, data: selected, displayData: selected, options: { options } };
    }

    case CellType.MCQ: {
      const options = opts || ["Option 1"];
      const count = Math.floor(rand() * 3) + 1;
      const shuffled = [...options].sort(() => rand() - 0.5);
      const selected = shuffled.slice(0, Math.min(count, shuffled.length));
      return { type: CellType.MCQ, data: selected, displayData: selected.join(", "), options: { options } };
    }

    case CellType.DropDown: {
      const options = opts || ["Option 1"];
      const selected = options[Math.floor(rand() * options.length)];
      return { type: CellType.DropDown, data: [selected], displayData: selected, options: { options } };
    }

    case CellType.YesNo: {
      const val = rand() > 0.5 ? "Yes" : "No";
      return { type: CellType.YesNo, data: val, displayData: val, options: { options: ["Yes", "No"] } };
    }

    case CellType.DateTime: {
      const year = 2023 + Math.floor(rand() * 3);
      const month = Math.floor(rand() * 12);
      const day = Math.floor(rand() * 28) + 1;
      const date = new Date(year, month, day);
      const isoString = date.toISOString();
      const displayData = formatDateDisplay(date);
      return {
        type: CellType.DateTime,
        data: isoString,
        displayData,
        options: { dateFormat: "MMM DD, YYYY", separator: "/", includeTime: false, isTwentyFourHourFormat: false },
      } as any;
    }

    case CellType.PhoneNumber: {
      const area = String(Math.floor(rand() * 900) + 100);
      const mid = String(Math.floor(rand() * 900) + 100);
      const last4 = String(Math.floor(rand() * 9000) + 1000);
      const phoneNumber = `${area}${mid}${last4}`;
      const displayData = `+1 (${area}) ${mid}-${last4}`;
      return {
        type: CellType.PhoneNumber,
        data: { countryCode: "US", countryNumber: "+1", phoneNumber },
        displayData,
      } as any;
    }

    case CellType.Currency: {
      const value = Math.floor(rand() * 49000) + 1000;
      const displayData = `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      return {
        type: CellType.Currency,
        data: { countryCode: "US", currencyCode: "USD", currencySymbol: "$", currencyValue: value },
        displayData,
      } as any;
    }

    case CellType.Address: {
      const loc = CITIES[Math.floor(rand() * CITIES.length)];
      const displayData = `${loc.city}, ${loc.state}`;
      return {
        type: CellType.Address,
        data: { city: loc.city, state: loc.state, country: "US" },
        displayData,
      } as any;
    }

    case CellType.Rating: {
      const rating = Math.floor(rand() * 5) + 1;
      return {
        type: CellType.Rating,
        data: rating,
        displayData: `${rating}/5`,
        options: { maxRating: 5 },
      } as any;
    }

    case CellType.Slider: {
      const progress = Math.floor(rand() * 101);
      return {
        type: CellType.Slider,
        data: progress,
        displayData: `${progress}%`,
        options: { minValue: 0, maxValue: 100 },
      } as any;
    }

    case CellType.Time: {
      const hour24 = Math.floor(rand() * 12) + 7;
      const minute = Math.floor(rand() * 4) * 15;
      const meridiem = hour24 >= 12 ? "PM" : "AM";
      const hour12 = hour24 % 12 || 12;
      const minuteStr = minute < 10 ? `0${minute}` : String(minute);
      const timeStr = `${hour12 < 10 ? "0" + hour12 : hour12}:${minuteStr}`;
      const isoValue = `${hour24 < 10 ? "0" + hour24 : hour24}:${minuteStr}:00`;
      const displayData = `${hour12}:${minuteStr} ${meridiem}`;
      return {
        type: CellType.Time,
        data: { time: timeStr, meridiem, ISOValue: isoValue },
        displayData,
        options: { isTwentyFourHour: false },
      } as any;
    }

    case CellType.CreatedTime: {
      const year = 2024 + Math.floor(rand() * 2);
      const month = Math.floor(rand() * 12);
      const day = Math.floor(rand() * 28) + 1;
      const hour = Math.floor(rand() * 10) + 8;
      const minute = Math.floor(rand() * 60);
      const date = new Date(year, month, day, hour, minute);
      const isoString = date.toISOString();
      const displayData = formatDateTimeDisplay(date);
      return {
        type: CellType.CreatedTime,
        data: isoString,
        displayData,
        readOnly: true,
        options: { dateFormat: "MMM DD, YYYY", separator: "/", includeTime: true, isTwentyFourHourFormat: false },
      } as any;
    }

    default: {
      return { type: CellType.String, data: "", displayData: "" };
    }
  }
}

export function generateMockRecords(columns: IColumn[], count: number = 100): IRecord[] {
  const rand = seededRandom(42);
  const records: IRecord[] = [];

  for (let i = 0; i < count; i++) {
    const cells: Record<string, ICell> = {};
    for (const col of columns) {
      cells[col.id] = generateCellForColumn(col, rand);
    }
    records.push({
      id: `rec_${String(i + 1).padStart(4, "0")}`,
      cells,
    });
  }

  return records;
}

export function generateMockRowHeaders(records: IRecord[]): IRowHeader[] {
  return records.map((record, index) => ({
    id: record.id,
    rowIndex: index,
    heightLevel: RowHeightLevel.Short,
  }));
}

export function generateMockTableData(): ITableData {
  const columns = generateMockColumns();
  const records = generateMockRecords(columns);
  const rowHeaders = generateMockRowHeaders(records);
  return { columns, records, rowHeaders };
}
