import {
	CellType,
	ICell,
	IColumn,
	IStringCell,
	INumberCell,
	IMCQCell,
	ISCQCell,
	IYesNoCell,
	IPhoneNumberCell,
	IZipCodeCell,
	ICurrencyCell,
	IDropDownCell,
	IAddressCell,
	IDateTimeCell,
	ICreatedTimeCell,
	IRankingCell,
	IRatingCell,
	IOpinionScaleCell,
	IEnrichmentCell,
	IFormulaCell,
	ISignatureCell,
	ISliderCell,
	IFileUploadCell,
	ITimeCell,
} from "@/types";
import { validateAndParseTime, formatTimeDisplay } from "@/utils/dateHelpers";
import { formatDate } from "@/cell-level/renderers/dateTime/utils/formatDate";

export const mapFieldTypeToCellType = (fieldType: string): CellType => {
	switch (fieldType) {
		case "SHORT_TEXT":
		case "LONG_TEXT":
		case "MULTI_LINE_TEXT":
		case "EMAIL":
		case "URL":
		case "RICH_TEXT":
		case "FORMULA":
			return CellType.String;
		case "NUMBER":
		case "PERCENT":
			return CellType.Number;
		case "RATING":
			return CellType.Rating;
		case "OPINION_SCALE":
			return CellType.OpinionScale;
		case "MCQ":
		case "SELECT":
			return CellType.MCQ;
		case "YES_NO":
			return CellType.YesNo;
		case "SCQ":
			return CellType.SCQ;
		case "PHONE_NUMBER":
			return CellType.PhoneNumber;
		case "ZIP_CODE":
			return CellType.ZipCode;
		case "CURRENCY":
			return CellType.Currency;
		case "DROP_DOWN":
		case "DROP_DOWN_STATIC":
			return CellType.DropDown;
		case "ADDRESS":
			return CellType.Address;
		case "DATE_TIME":
		case "DATE":
			return CellType.DateTime;
		case "RANKING":
			return CellType.Ranking;
		case "SIGNATURE":
			return CellType.Signature;
		case "SLIDER":
			return CellType.Slider;
		case "FILE_PICKER":
			return CellType.FileUpload;
		case "TIME":
			return CellType.Time;
		case "ENRICHMENT":
			return CellType.Enrichment;
		case "LIST":
			return CellType.List;
		case "CREATED_TIME":
			return CellType.CreatedTime;
		default:
			return CellType.String;
	}
};

export const createEmptyCellForType = (
	cellType: CellType,
	options?: any,
): ICell => {
	switch (cellType) {
		case CellType.Number:
			return {
				type: CellType.Number,
				data: null,
				displayData: "",
				...(options ? { options } : {}),
			};
		case CellType.MCQ:
			return {
				type: CellType.MCQ,
				data: [],
				displayData: "[]",
				...(options ? { options } : {}),
			};
		case CellType.YesNo:
			return {
				type: CellType.YesNo,
				data: null,
				displayData: "",
				...(options ? { options } : {}),
			};
		case CellType.SCQ:
			return {
				type: CellType.SCQ,
				data: null,
				displayData: "",
				...(options ? { options } : {}),
			};
		case CellType.PhoneNumber:
			return {
				type: CellType.PhoneNumber,
				data: null,
				displayData: "",
				...(options ? { options } : {}),
			};
		case CellType.ZipCode:
			return {
				type: CellType.ZipCode,
				data: null,
				displayData: "",
				...(options ? { options } : {}),
			};
		case CellType.Currency:
			return {
				type: CellType.Currency,
				data: null,
				displayData: "",
				...(options ? { options } : {}),
			};
		case CellType.DropDown:
			return {
				type: CellType.DropDown,
				data: null,
				displayData: "[]",
				...(options ? { options } : {}),
			};
		case CellType.Address:
			return {
				type: CellType.Address,
				data: null,
				displayData: "",
				...(options ? { options } : {}),
			};
		case CellType.DateTime:
			return {
				type: CellType.DateTime,
				data: null,
				displayData: "",
				...(options ? { options } : {}),
			};
		case CellType.CreatedTime:
			return {
				type: CellType.CreatedTime,
				data: null,
				displayData: "",
				readOnly: true as const,
				...(options ? { options } : {}),
			} as ICreatedTimeCell;
		case CellType.Signature:
			return {
				type: CellType.Signature,
				data: null,
				displayData: "",
				...(options ? { options } : {}),
			};
		case CellType.Slider:
			return {
				type: CellType.Slider,
				data: null,
				displayData: "",
				options: {
					minValue: 0,
					maxValue: 10,
					...(options || {}),
				},
			};
		case CellType.FileUpload:
			return {
				type: CellType.FileUpload,
				data: null,
				displayData: "",
				options: {
					maxFileSizeBytes: 10485760,
					noOfFilesAllowed: 100,
					...(options || {}),
				},
			};
		case CellType.Time:
			return {
				type: CellType.Time,
				data: null,
				displayData: "",
				options: {
					isTwentyFourHour: false,
					...(options || {}),
				},
			};
		case CellType.Ranking:
			return {
				type: CellType.Ranking,
				data: null,
				displayData: "",
				options: {
					options: [],
					...(options || {}),
				},
			} as IRankingCell;
		case CellType.Rating:
			return {
				type: CellType.Rating,
				data: null,
				displayData: "",
				options: {
					icon: "star",
					...(options || {}),
				},
			} as IRatingCell;
		case CellType.OpinionScale:
			return {
				type: CellType.OpinionScale,
				data: null,
				displayData: "",
				options: {
					maxValue: 10,
					...(options || {}),
				},
			} as IOpinionScaleCell;
		case CellType.List:
			return {
				type: CellType.List,
				data: [],
				displayData: "[]",
				...(options ? { options } : {}),
			} as unknown as ICell;
		default:
			return {
				type: CellType.String,
				data: "",
				displayData: "",
				...(options ? { options } : {}),
			};
	}
};

export const parseJsonSafe = <T>(value: string | null): T | null => {
	if (!value) return null;
	try {
		return JSON.parse(value) as T;
	} catch {
		return null;
	}
};

export const formatCell = (
	rawValue: any,
	column: IColumn & { rawType?: string; rawOptions?: any },
): ICell => {
	const { type, rawType, rawOptions } = column;

	if (type === CellType.Number) {
		if (rawValue === null || rawValue === undefined || rawValue === "") {
			return {
				type: CellType.Number,
				data: null,
				displayData: "",
				format: rawType === "NUMBER" ? "0.00" : undefined,
			} as INumberCell;
		}
		const numericValue =
			typeof rawValue === "number" ? rawValue : Number(rawValue);
		return {
			type: CellType.Number,
			data: Number.isFinite(numericValue) ? numericValue : null,
			displayData: Number.isFinite(numericValue)
				? String(numericValue)
				: "",
			format: rawType === "NUMBER" ? "0.00" : undefined,
		} as INumberCell;
	}

	if (type === CellType.MCQ) {
		const parsed = Array.isArray(rawValue)
			? rawValue
			: parseJsonSafe<string[]>(rawValue) || [];
		return {
			type: CellType.MCQ,
			data: parsed,
			displayData: JSON.stringify(parsed),
			options: rawOptions,
		} as IMCQCell;
	}

	if (type === CellType.List) {
		const parsed = Array.isArray(rawValue)
			? rawValue
			: parseJsonSafe<Array<string | number>>(rawValue) || [];
		return {
			type: CellType.List,
			data: parsed,
			displayData: JSON.stringify(parsed),
		} as unknown as ICell;
	}

	if (type === CellType.SCQ) {
		const stringValue =
			rawValue === null || rawValue === undefined
				? null
				: typeof rawValue === "string"
					? rawValue
					: String(rawValue);
		return {
			type: CellType.SCQ,
			data: stringValue,
			displayData: stringValue || "",
			options: rawOptions,
		} as ISCQCell;
	}

	if (type === CellType.YesNo) {
		const stringValue =
			rawValue === null || rawValue === undefined
				? null
				: typeof rawValue === "string"
					? rawValue
					: typeof rawValue === "boolean"
						? rawValue
							? "Yes"
							: "No"
						: String(rawValue);
		return {
			type: CellType.YesNo,
			data: stringValue as "Yes" | "No" | "Other" | null,
			displayData: stringValue || "",
			options: rawOptions,
			...(rawOptions?.other !== undefined && { other: rawOptions.other }),
		} as IYesNoCell & { other?: boolean };
	}

	if (type === CellType.PhoneNumber) {
		let parsed: {
			countryCode: string;
			countryNumber: string;
			phoneNumber: string;
		};
		if (
			typeof rawValue === "object" &&
			rawValue !== null &&
			!Array.isArray(rawValue)
		) {
			parsed = {
				countryCode: (rawValue as any).countryCode || "",
				countryNumber: (rawValue as any).countryNumber || "",
				phoneNumber: (rawValue as any).phoneNumber || "",
			};
		} else {
			parsed = parseJsonSafe<{
				countryCode: string;
				countryNumber: string;
				phoneNumber: string;
			}>(rawValue as string) || {
				countryCode: "",
				countryNumber: "",
				phoneNumber: "",
			};
		}
		return {
			type: CellType.PhoneNumber,
			data: parsed,
			displayData: JSON.stringify(parsed),
		} as IPhoneNumberCell;
	}

	if (type === CellType.ZipCode) {
		let parsed: { countryCode: string; zipCode: string };
		if (
			typeof rawValue === "object" &&
			rawValue !== null &&
			!Array.isArray(rawValue)
		) {
			parsed = {
				countryCode: (rawValue as any).countryCode || "",
				zipCode: (rawValue as any).zipCode || "",
			};
		} else {
			parsed = parseJsonSafe<{ countryCode: string; zipCode: string }>(
				rawValue as string,
			) || { countryCode: "", zipCode: "" };
		}
		return {
			type: CellType.ZipCode,
			data: parsed,
			displayData: JSON.stringify(parsed),
		} as IZipCodeCell;
	}

	if (type === CellType.Currency) {
		let parsed: {
			countryCode: string;
			currencyCode: string;
			currencySymbol: string;
			currencyValue: string;
		};
		if (
			typeof rawValue === "object" &&
			rawValue !== null &&
			!Array.isArray(rawValue)
		) {
			parsed = {
				countryCode: (rawValue as any).countryCode || "",
				currencyCode: (rawValue as any).currencyCode || "",
				currencySymbol: (rawValue as any).currencySymbol || "",
				currencyValue: (rawValue as any).currencyValue || "",
			};
		} else {
			parsed = parseJsonSafe<{
				countryCode: string;
				currencyCode: string;
				currencySymbol: string;
				currencyValue: string;
			}>(rawValue as string) || {
				countryCode: "",
				currencyCode: "",
				currencySymbol: "",
				currencyValue: "",
			};
		}
		return {
			type: CellType.Currency,
			data: parsed,
			displayData: JSON.stringify(parsed),
		} as ICurrencyCell;
	}

	if (type === CellType.DropDown) {
		let parsed:
			| string[]
			| Array<{ id: string | number; label: string }>
			| null = null;
		if (Array.isArray(rawValue)) {
			parsed = rawValue;
		} else if (typeof rawValue === "string") {
			parsed = parseJsonSafe<
				string[] | Array<{ id: string | number; label: string }>
			>(rawValue);
		}
		if (!parsed) parsed = [];
		return {
			type: CellType.DropDown,
			data: parsed,
			displayData: JSON.stringify(parsed),
			options: rawOptions,
		} as IDropDownCell;
	}

	if (type === CellType.Address) {
		let parsed: {
			fullName?: string;
			addressLineOne?: string;
			addressLineTwo?: string;
			zipCode?: string;
			city?: string;
			state?: string;
			country?: string;
		} | null = null;
		if (
			typeof rawValue === "object" &&
			rawValue !== null &&
			!Array.isArray(rawValue)
		) {
			parsed = rawValue;
		} else if (typeof rawValue === "string") {
			parsed = parseJsonSafe<{
				fullName?: string;
				addressLineOne?: string;
				addressLineTwo?: string;
				zipCode?: string;
				city?: string;
				state?: string;
				country?: string;
			}>(rawValue);
		}
		let displayData = "";
		if (parsed) {
			const addressParts: string[] = [];
			if (parsed.fullName) addressParts.push(parsed.fullName);
			if (parsed.addressLineOne) addressParts.push(parsed.addressLineOne);
			if (parsed.addressLineTwo) addressParts.push(parsed.addressLineTwo);
			if (parsed.zipCode) addressParts.push(parsed.zipCode);
			if (parsed.city) addressParts.push(parsed.city);
			if (parsed.state) addressParts.push(parsed.state);
			if (parsed.country) addressParts.push(parsed.country);
			displayData = addressParts.join(", ");
		}
		return {
			type: CellType.Address,
			data: parsed,
			displayData,
		} as IAddressCell;
	}

	if (type === CellType.DateTime) {
		let dateTimeString: string | null = null;
		if (typeof rawValue === "string" && rawValue.trim() !== "") {
			dateTimeString = rawValue;
		} else if (rawValue === null || rawValue === undefined) {
			dateTimeString = null;
		} else {
			dateTimeString = String(rawValue);
		}
		let options: any = {};
		if (rawOptions) {
			if (
				rawOptions.includeTime !== undefined ||
				rawOptions.dateFormat !== undefined ||
				rawOptions.separator !== undefined
			) {
				options = rawOptions;
			} else if (rawOptions.options) {
				options = rawOptions.options;
			}
		}
		const {
			dateFormat = "DDMMYYYY",
			separator = "/",
			includeTime: includeTimeRaw = undefined,
			isTwentyFourHourFormat: isTwentyFourHourFormatRaw = false,
		} = options;
		const defaultIncludeTime = column.rawType === "DATE_TIME";
		const finalIncludeTimeRaw =
			includeTimeRaw !== undefined ? includeTimeRaw : defaultIncludeTime;
		const normalizeBoolean = (
			value: boolean | string | number | undefined,
		): boolean =>
			Boolean(
				value === true ||
					value === "true" ||
					value === 1 ||
					value === "1" ||
					String(value).toLowerCase() === "true",
			);
		const includeTime = normalizeBoolean(finalIncludeTimeRaw);
		const isTwentyFourHourFormat = normalizeBoolean(
			isTwentyFourHourFormatRaw,
		);
		let displayData = "";
		if (dateTimeString) {
			const formatted = formatDate(
				dateTimeString,
				dateFormat,
				separator,
				includeTime,
				isTwentyFourHourFormat,
			);
			displayData = formatted || "";
		}
		return {
			type: CellType.DateTime,
			data: dateTimeString,
			displayData,
			options: {
				dateFormat,
				separator,
				includeTime,
				isTwentyFourHourFormat,
			},
		} as IDateTimeCell;
	}

	if (type === CellType.CreatedTime) {
		let createdTimeString: string | null = null;
		if (typeof rawValue === "string" && rawValue.trim() !== "") {
			createdTimeString = rawValue;
		} else if (rawValue === null || rawValue === undefined) {
			createdTimeString = null;
		} else {
			createdTimeString = String(rawValue);
		}
		let options: any = {};
		if (rawOptions) {
			if (
				rawOptions.includeTime !== undefined ||
				rawOptions.dateFormat !== undefined ||
				rawOptions.separator !== undefined
			) {
				options = rawOptions;
			} else if (rawOptions.options) {
				options = rawOptions.options;
			}
		}
		const {
			dateFormat = "DDMMYYYY",
			separator = "/",
			includeTime: includeTimeRaw = undefined,
			isTwentyFourHourFormat: isTwentyFourHourFormatRaw = false,
		} = options;
		// Default includeTime to true to match sheets
		const finalIncludeTimeRaw =
			includeTimeRaw !== undefined ? includeTimeRaw : true;
		const normalizeBoolean = (
			value: boolean | string | number | undefined,
		): boolean =>
			Boolean(
				value === true ||
					value === "true" ||
					value === 1 ||
					value === "1" ||
					String(value).toLowerCase() === "true",
			);
		const includeTime = normalizeBoolean(finalIncludeTimeRaw);
		const isTwentyFourHourFormat = normalizeBoolean(
			isTwentyFourHourFormatRaw,
		);
		let displayData = "";
		if (createdTimeString) {
			const formatted = formatDate(
				createdTimeString,
				dateFormat,
				separator,
				includeTime,
				isTwentyFourHourFormat,
			);
			displayData = formatted || "";
		}
		return {
			type: CellType.CreatedTime,
			data: createdTimeString,
			displayData,
			readOnly: true as const,
			options: {
				dateFormat,
				separator,
				includeTime,
				isTwentyFourHourFormat,
			},
		} as ICreatedTimeCell;
	}

	if (type === CellType.Signature) {
		const signatureUrl =
			rawValue === null || rawValue === undefined
				? null
				: typeof rawValue === "string"
					? rawValue
					: String(rawValue);
		return {
			type: CellType.Signature,
			data: signatureUrl,
			displayData: signatureUrl || "",
		} as ISignatureCell;
	}

	if (type === CellType.Slider) {
		const numericValue =
			rawValue === null || rawValue === undefined
				? null
				: typeof rawValue === "number"
					? rawValue
					: Number(rawValue);
		const minValue = rawOptions?.minValue ?? 0;
		const maxValue = rawOptions?.maxValue ?? 10;
		const displayData =
			numericValue !== null && !Number.isNaN(numericValue)
				? `${numericValue}/${maxValue}`
				: "";
		return {
			type: CellType.Slider,
			data:
				numericValue !== null && !Number.isNaN(numericValue)
					? numericValue
					: null,
			displayData,
			options: { minValue, maxValue },
		} as ISliderCell;
	}

	if (type === CellType.FileUpload) {
		if (rawValue === null || rawValue === undefined || rawValue === "") {
			return {
				type: CellType.FileUpload,
				data: null,
				displayData: "",
				options: {
					maxFileSizeBytes: rawOptions?.maxFileSizeBytes ?? 10485760,
					allowedFileTypes: rawOptions?.allowedFileTypes ?? [],
					noOfFilesAllowed: rawOptions?.noOfFilesAllowed ?? 100,
				},
			} as IFileUploadCell;
		}
		let parsedValue: Array<{
			url: string;
			size: number;
			mimeType: string;
		}> | null = null;
		let isValid = false;
		try {
			let parsed: any;
			if (typeof rawValue === "string") {
				parsed = JSON.parse(rawValue);
			} else {
				parsed = rawValue;
			}
			if (typeof parsed === "number") {
				isValid = false;
				parsedValue = null;
			} else if (
				parsed === null ||
				parsed === undefined ||
				(Array.isArray(parsed) && parsed.length === 0) ||
				(typeof parsed === "object" &&
					!Array.isArray(parsed) &&
					Object.keys(parsed).length === 0)
			) {
				isValid = true;
				parsedValue = null;
			} else if (
				Array.isArray(parsed) &&
				parsed.every((item) => item?.url)
			) {
				isValid = true;
				parsedValue = parsed;
			} else {
				isValid = false;
				parsedValue = null;
			}
		} catch (e) {
			isValid = false;
			parsedValue = null;
		}
		const maxFileSizeBytes = rawOptions?.maxFileSizeBytes ?? 10485760;
		const allowedFileTypes = rawOptions?.allowedFileTypes ?? [];
		const noOfFilesAllowed = rawOptions?.noOfFilesAllowed ?? 100;
		let displayData = "";
		if (isValid && parsedValue) {
			displayData = JSON.stringify(parsedValue);
		} else if (!isValid) {
			displayData =
				typeof rawValue === "string"
					? rawValue
					: typeof rawValue === "number"
						? String(rawValue)
						: JSON.stringify(rawValue);
		}
		return {
			type: CellType.FileUpload,
			data: isValid ? parsedValue : null,
			displayData,
			options: {
				maxFileSizeBytes,
				allowedFileTypes,
				noOfFilesAllowed,
			},
		} as IFileUploadCell;
	}

	if (type === CellType.Time) {
		const isTwentyFourHour = rawOptions?.isTwentyFourHour ?? false;
		if (rawValue === null || rawValue === undefined || rawValue === "") {
			return {
				type: CellType.Time,
				data: null,
				displayData: "",
				options: { isTwentyFourHour },
			} as ITimeCell;
		}
		const { isValid, parsedValue } = validateAndParseTime(
			rawValue,
			isTwentyFourHour,
		);
		let displayData = "";
		if (isValid && parsedValue && parsedValue.time) {
			displayData = formatTimeDisplay(
				parsedValue.time,
				parsedValue.meridiem,
				isTwentyFourHour,
			);
		} else if (!isValid) {
			displayData =
				typeof rawValue === "string"
					? rawValue
					: typeof rawValue === "number"
						? String(rawValue)
						: JSON.stringify(rawValue);
		}
		return {
			type: CellType.Time,
			data: isValid ? parsedValue : null,
			displayData,
			options: { isTwentyFourHour },
		} as ITimeCell;
	}

	if (type === CellType.Ranking) {
		let rankingData: Array<{
			id: string;
			rank: number;
			label: string;
		}> | null = null;
		if (rawValue) {
			try {
				if (typeof rawValue === "string") {
					const parsed = JSON.parse(rawValue);
					if (Array.isArray(parsed)) rankingData = parsed;
				} else if (Array.isArray(rawValue)) {
					rankingData = rawValue;
				}
			} catch (e) {
				rankingData = null;
			}
		}
		const rankingOptions = rawOptions?.options || [];
		return {
			type: CellType.Ranking,
			data: rankingData,
			displayData: rankingData ? JSON.stringify(rankingData) : "",
			options: { options: rankingOptions },
		} as IRankingCell;
	}

	if (type === CellType.Rating) {
		const maxRating = rawOptions?.maxRating ?? 10;
		const iconRaw = rawOptions?.icon;
		const icon = iconRaw ?? "star";
		const color = rawOptions?.color;
		let ratingValue: number | null = null;
		if (rawValue !== null && rawValue !== undefined) {
			const numericValue =
				typeof rawValue === "number"
					? rawValue
					: typeof rawValue === "string"
						? parseInt(rawValue, 10)
						: null;
			if (
				numericValue !== null &&
				!Number.isNaN(numericValue) &&
				Number.isInteger(numericValue) &&
				numericValue >= 1 &&
				numericValue <= maxRating
			) {
				ratingValue = numericValue;
			}
		}
		const displayData = ratingValue ? `${ratingValue}/${maxRating}` : "";
		return {
			type: CellType.Rating,
			data: ratingValue,
			displayData,
			options: { maxRating, icon, ...(color && { color }) },
		} as IRatingCell;
	}

	if (type === CellType.OpinionScale) {
		const maxValue = rawOptions?.maxValue ?? 10;
		const opinionScaleValue =
			rawValue === null || rawValue === undefined
				? null
				: typeof rawValue === "number"
					? rawValue
					: Number(rawValue);
		const displayData =
			opinionScaleValue !== null && !Number.isNaN(opinionScaleValue)
				? `${opinionScaleValue}/${maxValue}`
				: "";
		return {
			type: CellType.OpinionScale,
			data:
				opinionScaleValue !== null && !Number.isNaN(opinionScaleValue)
					? opinionScaleValue
					: null,
			displayData,
			options: { maxValue },
		} as IOpinionScaleCell;
	}

	if (type === CellType.Enrichment) {
		const stringValue =
			rawValue === null || rawValue === undefined ? "" : String(rawValue);
		const config = rawOptions?.config || {};
		const identifier = rawOptions?.identifier || config.identifier || [];
		return {
			type: CellType.Enrichment,
			data: stringValue || null,
			displayData: stringValue,
			readOnly: true,
			options: {
				config: {
					identifier: identifier.map((ident: any) => ({
						field_id: ident.field_id || ident.fieldId,
						dbFieldName: ident.dbFieldName || ident.db_field_name,
						required: ident.required || false,
					})),
				},
			},
		} as IEnrichmentCell;
	}

	if (rawType === "FORMULA") {
		const stringValue =
			rawValue === null || rawValue === undefined ? "" : String(rawValue);
		const computedFieldMeta =
			rawOptions?.computedFieldMeta ||
			(column as any).computedFieldMeta ||
			{};
		return {
			type: CellType.String,
			data: stringValue || null,
			displayData: stringValue,
			readOnly: true,
			options: {
				computedFieldMeta: {
					hasError: computedFieldMeta.hasError || false,
					shouldShowLoading:
						computedFieldMeta.shouldShowLoading || false,
					expression: computedFieldMeta.expression,
				},
			},
		} as IFormulaCell;
	}

	const fieldReadOnly = (column as any).readOnly || false;
	const stringValue =
		rawValue === null || rawValue === undefined ? "" : String(rawValue);
	const baseCell = {
		type: CellType.String,
		data: stringValue,
		displayData: stringValue,
	} as IStringCell;
	if (fieldReadOnly) {
		(baseCell as any).readOnly = true;
	}
	return baseCell;
};
