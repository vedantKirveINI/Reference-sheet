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

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
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
