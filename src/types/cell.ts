export enum CellType {
  String = "String",
  Number = "Number",
  MCQ = "MCQ",
  SCQ = "SCQ",
  YesNo = "YesNo",
  PhoneNumber = "PhoneNumber",
  ZipCode = "ZipCode",
  Currency = "Currency",
  DropDown = "DropDown",
  Address = "Address",
  DateTime = "DateTime",
  Signature = "Signature",
  Slider = "Slider",
  FileUpload = "FileUpload",
  Time = "Time",
  Ranking = "Ranking",
  Rating = "Rating",
  OpinionScale = "OpinionScale",
  Enrichment = "Enrichment",
  Formula = "Formula",
  List = "List",
  CreatedTime = "CreatedTime",
}

export interface IPhoneNumberData {
  countryCode: string;
  countryNumber: string;
  phoneNumber: string;
}

export interface IZipCodeData {
  countryCode: string;
  zipCode: string;
}

export interface ICurrencyData {
  countryCode: string;
  currencyCode: string;
  currencySymbol: string;
  currencyValue: number;
  currencyDisplay?: string;
}

export interface IDropDownOption {
  id: string | number;
  label: string;
}

export interface IAddressData {
  fullName?: string;
  addressLineOne?: string;
  addressLineTwo?: string;
  zipCode?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface IDateTimeOptions {
  dateFormat: string;
  separator: string;
  includeTime: boolean;
  isTwentyFourHourFormat: boolean;
}

export interface IFileUploadItem {
  url: string;
  size: number;
  mimeType: string;
}

export interface IFileUploadOptions {
  maxFileSizeBytes?: number;
  allowedFileTypes?: string[];
  noOfFilesAllowed?: number;
  fieldName?: string;
}

export interface ITimeData {
  time: string;
  meridiem: string;
  ISOValue: string;
  timeZone?: string;
}

export interface IRankingItem {
  id: string | number;
  rank: number;
  label: string;
}

export interface IRankingOption {
  id: string | number;
  label: string;
}

export interface IEnrichmentIdentifier {
  field_id: string;
  dbFieldName: string;
  required: boolean;
}

export interface IComputedFieldMeta {
  hasError?: boolean;
  shouldShowLoading?: boolean;
  expression?: string;
}

export interface IStringCell {
  type: CellType.String;
  data: string;
  displayData: string;
}

export interface INumberCell {
  type: CellType.Number;
  data: number | null;
  displayData: string;
  options?: {
    format?: string;
  };
}

export interface IMCQCell {
  type: CellType.MCQ;
  data: string[];
  displayData: string;
  options: {
    options: string[];
  };
}

export interface ISCQCell {
  type: CellType.SCQ;
  data: string | null;
  displayData: string;
  options: {
    options: string[];
  };
}

export interface IYesNoCell {
  type: CellType.YesNo;
  data: "Yes" | "No" | "Other" | string | null;
  displayData: string;
  options: {
    options: string[];
    other?: boolean;
  };
}

export interface IPhoneNumberCell {
  type: CellType.PhoneNumber;
  data: IPhoneNumberData | null;
  displayData: string;
}

export interface IZipCodeCell {
  type: CellType.ZipCode;
  data: IZipCodeData | null;
  displayData: string;
}

export interface ICurrencyCell {
  type: CellType.Currency;
  data: ICurrencyData | null;
  displayData: string;
}

export interface IDropDownCell {
  type: CellType.DropDown;
  data: string[] | IDropDownOption[] | null;
  displayData: string;
  options: {
    options: string[] | IDropDownOption[];
  };
}

export interface IAddressCell {
  type: CellType.Address;
  data: IAddressData | null;
  displayData: string;
}

export interface IDateTimeCell {
  type: CellType.DateTime;
  data: string | null;
  displayData: string;
  options: IDateTimeOptions;
}

export interface ICreatedTimeCell {
  type: CellType.CreatedTime;
  data: string | null;
  displayData: string;
  readOnly: true;
  options: IDateTimeOptions;
}

export interface ISignatureCell {
  type: CellType.Signature;
  data: string | null;
  displayData: string;
}

export interface ISliderCell {
  type: CellType.Slider;
  data: number | null;
  displayData: string;
  options: {
    minValue: number;
    maxValue: number;
  };
}

export interface IFileUploadCell {
  type: CellType.FileUpload;
  data: IFileUploadItem[] | null;
  displayData: string;
  options: IFileUploadOptions;
}

export interface ITimeCell {
  type: CellType.Time;
  data: ITimeData | null;
  displayData: string;
  options: {
    isTwentyFourHour: boolean;
  };
}

export interface IRankingCell {
  type: CellType.Ranking;
  data: IRankingItem[] | null;
  displayData: string;
  options: {
    options: IRankingOption[];
  };
}

export interface IRatingCell {
  type: CellType.Rating;
  data: number | null;
  displayData: string;
  options?: {
    maxRating?: number;
    icon?: string;
    color?: string;
  };
}

export interface IOpinionScaleCell {
  type: CellType.OpinionScale;
  data: number | null;
  displayData: string;
  options?: {
    maxValue?: number;
  };
}

export interface IEnrichmentCell {
  type: CellType.Enrichment;
  data: string | null;
  displayData: string;
  readOnly: true;
  options?: {
    config?: {
      identifier?: IEnrichmentIdentifier[];
    };
  };
}

export interface IFormulaCell {
  type: CellType.String;
  data: string | null;
  displayData: string;
  readOnly: true;
  options?: {
    computedFieldMeta?: IComputedFieldMeta;
  };
}

export interface IListCell {
  type: CellType.List;
  data: Array<string | number>;
  displayData: string;
}

export type ICell =
  | IStringCell
  | INumberCell
  | IMCQCell
  | ISCQCell
  | IYesNoCell
  | IPhoneNumberCell
  | IZipCodeCell
  | ICurrencyCell
  | IDropDownCell
  | IAddressCell
  | IDateTimeCell
  | ICreatedTimeCell
  | ISignatureCell
  | ISliderCell
  | IFileUploadCell
  | ITimeCell
  | IRankingCell
  | IRatingCell
  | IOpinionScaleCell
  | IEnrichmentCell
  | IFormulaCell
  | IListCell;
