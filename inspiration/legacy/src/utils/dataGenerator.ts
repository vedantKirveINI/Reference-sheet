// Inspired by Teable's data generation patterns
import {
	CellType,
	IColumn,
	IRecord,
	ICell,
	IStringCell,
	INumberCell,
	IMCQCell,
	ISCQCell,
	IYesNoCell,
	IPhoneNumberCell,
	IZipCodeCell,
	IRowHeader,
	RowHeightLevel,
} from "../types";

// Generate 3 columns - one of each data type
export const generateColumnHeaders = (): IColumn[] => {
	const columns: IColumn[] = [];

	// String column
	columns.push({
		id: "col_name",
		name: "Name",
		type: CellType.String,
		width: 200,
		isFrozen: true,
	});

	// Number column
	columns.push({
		id: "col_age",
		name: "Age",
		type: CellType.Number,
		width: 120,
		isFrozen: false,
	});

	// MCQ column
	columns.push({
		id: "col_preferences",
		name: "Preferences",
		type: CellType.MCQ,
		width: 300,
		isFrozen: false,
		options: [
			"Red",
			"Blue",
			"Green",
			"Yellow",
			"Purple",
			"Orange",
			"Pink",
			"Black",
			"White",
			"Gray",
		],
	});

	// Yes/No column
	columns.push({
		id: "col_active",
		name: "Active?",
		type: CellType.YesNo,
		width: 150,
		isFrozen: false,
		options: ["Yes", "No", "Other"],
	});

	// Phone Number column
	columns.push({
		id: "col_phone",
		name: "Phone Number",
		type: CellType.PhoneNumber,
		width: 250,
		isFrozen: false,
	});

	// Zip Code column
	columns.push({
		id: "col_zip",
		name: "Zip Code",
		type: CellType.ZipCode,
		width: 220,
		isFrozen: false,
	});

	// Currency column
	columns.push({
		id: "col_currency",
		name: "Currency",
		type: CellType.Currency,
		width: 240,
		isFrozen: false,
	});

	return columns;
};

// Mock data generators
const stringData = [
	"John Doe",
	"Jane Smith",
	"Alice Johnson",
	"Bob Wilson",
	"Carol Brown",
	"David Lee",
	"Emma Davis",
	"Frank Miller",
	"Grace Taylor",
	"Henry Anderson",
	"Ivy Martinez",
	"Jack Thompson",
	"Kate Garcia",
	"Liam Rodriguez",
	"Mia Wilson",
	"Noah Martinez",
	"Olivia Anderson",
	"Parker Taylor",
	"Quinn Brown",
	"Riley Davis",
	"Sophia Wilson",
	"Tyler Johnson",
	"Uma Smith",
	"Victor Lee",
	"Wendy Garcia",
	"Xavier Rodriguez",
	"Yara Thompson",
	"Zoe Martinez",
	"Adam Wilson",
	"Bella Davis",
];

const numberData = [
	100, 250, 375, 500, 125, 750, 300, 425, 600, 175, 325, 450, 275, 550, 200,
	675, 350, 475, 150, 625, 400, 525, 225, 575, 300, 700, 375, 450, 250, 550,
];

// Generate sample data for String cells
const generateStringData = (): string => {
	return stringData[Math.floor(Math.random() * stringData.length)];
};

// Generate sample data for Number cells
const generateNumberData = (): number => {
	return numberData[Math.floor(Math.random() * numberData.length)];
};

// Create a cell based on type
// Generate MCQ data - randomly select 1-3 options from available options
const generateSCQData = (options: string[]): string | null => {
	if (!options || options.length === 0) {
		return null;
	}
	// Randomly select one option
	const randomIndex = Math.floor(Math.random() * options.length);
	return options[randomIndex];
};

const generateMCQData = (options: string[]): string[] => {
	if (options.length === 0) return [];

	const numSelections = Math.floor(Math.random() * 3) + 1; // 1-3 selections
	const shuffled = [...options].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, Math.min(numSelections, options.length));
};

// Generate Phone Number data
// Common country codes for variety
const countryCodes = [
	"IN",
	"US",
	"GB",
	"CA",
	"AU",
	"DE",
	"FR",
	"IT",
	"ES",
	"BR",
	"CN",
	"JP",
	"KR",
	"MX",
	"NL",
	"SE",
	"CH",
	"SG",
	"AE",
	"SA",
	"ZA",
	"NZ",
	"NO",
	"DK",
	"FI",
	"PL",
	"TR",
	"AR",
	"CL",
	"CO",
	"PE",
	"PH",
	"TH",
	"VN",
	"ID",
	"MY",
	"PK",
	"BD",
	"EG",
	"NG",
	"KE",
	"IL",
	"IE",
	"PT",
	"GR",
	"BE",
	"AT",
	"CZ",
	"HU",
	"RO",
	"AL",
];

// Country number mapping (simplified - matches countryCodes order)
const countryNumbers: Record<string, string> = {
	IN: "91",
	US: "1",
	GB: "44",
	CA: "1",
	AU: "61",
	DE: "49",
	FR: "33",
	IT: "39",
	ES: "34",
	BR: "55",
	CN: "86",
	JP: "81",
	KR: "82",
	MX: "52",
	NL: "31",
	SE: "46",
	CH: "41",
	SG: "65",
	AE: "971",
	SA: "966",
	ZA: "27",
	NZ: "64",
	NO: "47",
	DK: "45",
	FI: "358",
	PL: "48",
	TR: "90",
	AR: "54",
	CL: "56",
	CO: "57",
	PE: "51",
	PH: "63",
	TH: "66",
	VN: "84",
	ID: "62",
	MY: "60",
	PK: "92",
	BD: "880",
	EG: "20",
	NG: "234",
	KE: "254",
	IL: "972",
	IE: "353",
	PT: "351",
	GR: "30",
	BE: "32",
	AT: "43",
	CZ: "420",
	HU: "36",
	RO: "40",
	AL: "355",
};

const generatePhoneNumberData = (): {
	countryCode: string;
	countryNumber: string;
	phoneNumber: string;
} => {
	// Randomly select a country
	const countryCode =
		countryCodes[Math.floor(Math.random() * countryCodes.length)];
	const countryNumber = countryNumbers[countryCode] || "1";

	// Generate random phone number (8-10 digits)
	const phoneLength = Math.floor(Math.random() * 3) + 8; // 8-10 digits
	let phoneNumber = "";
	for (let i = 0; i < phoneLength; i++) {
		phoneNumber += Math.floor(Math.random() * 10).toString();
	}

	return {
		countryCode,
		countryNumber,
		phoneNumber,
	};
};

const zipCodeSamples: Record<string, string[]> = {
	US: ["10001", "30301", "60601", "73301"],
	CA: ["M5V 2T6", "V5K 0A1", "H1A 0A1"],
	GB: ["SW1A 1AA", "EC1A 1BB", "W1A 0AX"],
	IN: ["560001", "400001", "110001"],
	AU: ["2000", "3000", "4000"],
	DE: ["10115", "20095", "50667"],
	FR: ["75001", "13001", "31000"],
	JP: ["100-0001", "150-0001", "060-0001"],
};

const generateZipCodeData = (): {
	countryCode: string;
	zipCode: string;
} => {
	const codes = Object.keys(zipCodeSamples);
	const countryCode = codes[Math.floor(Math.random() * codes.length)];
	const samples = zipCodeSamples[countryCode] || ["00000"];
	const zipCode = samples[Math.floor(Math.random() * samples.length)];

	return {
		countryCode,
		zipCode,
	};
};

const currencySamples = [
	{
		countryCode: "US",
		currencyCode: "USD",
		currencySymbol: "$",
	},
	{
		countryCode: "IN",
		currencyCode: "INR",
		currencySymbol: "₹",
	},
	{
		countryCode: "GB",
		currencyCode: "GBP",
		currencySymbol: "£",
	},
	{
		countryCode: "EU",
		currencyCode: "EUR",
		currencySymbol: "€",
	},
];

const generateCurrencyData = () => {
	const sample =
		currencySamples[Math.floor(Math.random() * currencySamples.length)];
	const value = (Math.random() * 1000).toFixed(2);
	return {
		...sample,
		currencyValue: value,
	};
};

const generateYesNoData = (): "Yes" | "No" | "Other" => {
	const values: Array<"Yes" | "No" | "Other"> = ["Yes", "No", "Other"];
	return values[Math.floor(Math.random() * values.length)];
};

const createCell = (type: CellType, options?: string[]): ICell => {
	if (type === CellType.String) {
		const data = generateStringData();
		return {
			type: CellType.String,
			data,
			displayData: data,
		} as IStringCell;
	} else if (type === CellType.Number) {
		const data = generateNumberData();
		return {
			type: CellType.Number,
			data,
			displayData: data.toString(),
			format: "0.00",
		} as INumberCell;
	} else if (type === CellType.MCQ) {
		const selectedOptions = generateMCQData(options || []);
		return {
			type: CellType.MCQ,
			data: selectedOptions,
			displayData: JSON.stringify(selectedOptions),
			options,
		} as IMCQCell;
	} else if (type === CellType.SCQ) {
		const selectedOption = generateSCQData(options || []);
		return {
			type: CellType.SCQ,
			data: selectedOption,
			displayData: selectedOption || "",
			options,
		} as ISCQCell;
	} else if (type === CellType.YesNo) {
		const value = generateYesNoData();
		return {
			type: CellType.YesNo,
			data: value,
			displayData: value,
			options,
		} as IYesNoCell;
	} else if (type === CellType.PhoneNumber) {
		const phoneData = generatePhoneNumberData();
		return {
			type: CellType.PhoneNumber,
			data: phoneData,
			displayData: JSON.stringify(phoneData),
		} as IPhoneNumberCell;
	} else if (type === CellType.ZipCode) {
		const zipData = generateZipCodeData();
		return {
			type: CellType.ZipCode,
			data: zipData,
			displayData: JSON.stringify(zipData),
		} as IZipCodeCell;
	} else if (type === CellType.Currency) {
		const currencyData = generateCurrencyData();
		return {
			type: CellType.Currency,
			data: currencyData,
			displayData: JSON.stringify(currencyData),
		} as ICurrencyCell;
	} else {
		// Fallback to string
		const data = generateStringData();
		return {
			type: CellType.String,
			data,
			displayData: data,
		} as IStringCell;
	}
};

// Generate row headers - All rows have same height (Inspired by Teable)
export const generateRowHeaders = (recordCount: number = 50): IRowHeader[] => {
	const rowHeaders: IRowHeader[] = [];

	// All rows use the same height level (Short for compact default)
	const defaultHeightLevel = RowHeightLevel.Short;

	for (let rowIndex = 0; rowIndex < recordCount; rowIndex++) {
		rowHeaders.push({
			id: `row_header_${rowIndex}`,
			rowIndex: rowIndex,
			heightLevel: defaultHeightLevel, // All rows same height
			displayIndex: rowIndex + 1, // 1, 2, 3, etc.
		});
	}

	return rowHeaders;
};

// Generate 50 records with 3 columns each
export const generateTableData = (): {
	columns: IColumn[];
	records: IRecord[];
	rowHeaders: IRowHeader[];
} => {
	const columns = generateColumnHeaders();
	const records: IRecord[] = [];
	const recordCount = 1000; // Match record count with row headers
	const rowHeaders = generateRowHeaders(recordCount);

	for (let rowIndex = 0; rowIndex < recordCount; rowIndex++) {
		const cells: Record<string, ICell> = {};

		columns.forEach((column) => {
			cells[column.id] = createCell(column.type, column.options);
		});

		records.push({
			id: `record_${rowIndex + 1}`,
			cells,
		});
	}

	return { columns, records, rowHeaders };
};

// Generate dynamic headers based on backend data structure
export const generateDynamicHeaders = (
	headerData: Array<{
		id: string;
		name: string;
		type: "string" | "number" | "currency";
		width?: number;
		isFrozen?: boolean;
	}>,
): IColumn[] => {
	return headerData.map((header) => ({
		id: header.id,
		name: header.name,
		type:
			header.type === "string"
				? CellType.String
				: header.type === "currency"
					? CellType.Currency
					: CellType.Number,
		width: header.width || (header.type === "string" ? 150 : 120),
		isFrozen: header.isFrozen || false,
	}));
};

// Simulate backend data structure
export const mockBackendHeaders = () => [
	{
		id: "id",
		name: "ID",
		type: "string" as const,
		width: 80,
		isFrozen: true,
	},
	{
		id: "name",
		name: "Name",
		type: "string" as const,
		width: 200,
		isFrozen: true,
	},
	{ id: "age", name: "Age", type: "number" as const, width: 80 },
	{ id: "salary", name: "Salary", type: "number" as const, width: 120 },
	{
		id: "department",
		name: "Department",
		type: "string" as const,
		width: 150,
	},
	{ id: "email", name: "Email", type: "string" as const, width: 250 },
	{ id: "phone", name: "Phone", type: "string" as const, width: 150 },
	{
		id: "experience",
		name: "Experience",
		type: "number" as const,
		width: 100,
	},
	{ id: "rating", name: "Rating", type: "number" as const, width: 100 },
	{ id: "status", name: "Status", type: "string" as const, width: 120 },
	{ id: "location", name: "Location", type: "string" as const, width: 150 },
	{ id: "score", name: "Score", type: "number" as const, width: 100 },
	{ id: "category", name: "Category", type: "string" as const, width: 120 },
	{ id: "priority", name: "Priority", type: "number" as const, width: 100 },
	{
		id: "description",
		name: "Description",
		type: "string" as const,
		width: 300,
	},
	{ id: "count", name: "Count", type: "number" as const, width: 80 },
	{ id: "price", name: "Price", type: "number" as const, width: 120 },
	{ id: "currency", name: "Currency", type: "CURRENCY" as const, width: 240 },
	{ id: "date", name: "Date", type: "string" as const, width: 120 },
	{ id: "time", name: "Time", type: "string" as const, width: 100 },
	{ id: "duration", name: "Duration", type: "number" as const, width: 100 },
	{ id: "frequency", name: "Frequency", type: "number" as const, width: 120 },
	{ id: "type", name: "Type", type: "string" as const, width: 100 },
	{ id: "level", name: "Level", type: "number" as const, width: 80 },
	{ id: "weight", name: "Weight", type: "number" as const, width: 100 },
	{ id: "notes", name: "Notes", type: "string" as const, width: 250 },
];
