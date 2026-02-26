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
  Link = "Link",
  User = "User",
  CreatedBy = "CreatedBy",
  LastModifiedBy = "LastModifiedBy",
  LastModifiedTime = "LastModifiedTime",
  AutoNumber = "AutoNumber",
  Button = "Button",
  Checkbox = "Checkbox",
  Rollup = "Rollup",
  Lookup = "Lookup",
  ID = "ID",
}

export function isSystemField(cellType: CellType): boolean {
  return (
    cellType === CellType.CreatedTime ||
    cellType === CellType.CreatedBy ||
    cellType === CellType.LastModifiedBy ||
    cellType === CellType.LastModifiedTime ||
    cellType === CellType.AutoNumber ||
    cellType === CellType.ID
  );
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
  currencyValue: string | number;
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
  type: CellType.Formula;
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

export interface IUserInfo {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface ILinkRecord {
  id: number;
  title: string;
}

export interface ILinkOptions {
  foreignTableId: number | string;
  relationship: "ManyMany" | "OneMany" | "ManyOne" | "OneOne";
  symmetricFieldId?: number;
  isOneWay?: boolean;
}

export interface ILookupOptions {
  linkFieldId: number;
  lookupFieldId: number;
  foreignTableId: number;
}

export interface IRollupOptions extends ILookupOptions {
  expression: string;
}

export interface IButtonOptions {
  label?: string;
  style?: "primary" | "default" | "danger" | "success" | "warning";
  actionType?: "openUrl" | "runScript" | "none";
  url?: string;
  scriptId?: string;
  maxCount?: number;
  resetCount?: boolean;
  confirm?: {
    title?: string;
    description?: string;
    confirmText?: string;
  };
  action?: string;
  actionConfig?: any;
}

export interface IButtonClickData {
  clickCount: number;
  lastClicked: string | null;
}

export interface ILinkCell {
  type: CellType.Link;
  data: ILinkRecord[] | null;
  displayData: string;
  options: ILinkOptions;
}

export interface IUserCell {
  type: CellType.User;
  data: IUserInfo[] | null;
  displayData: string;
  options?: {
    isMultiple?: boolean;
    shouldNotify?: boolean;
  };
}

export interface ICreatedByCell {
  type: CellType.CreatedBy;
  data: IUserInfo | null;
  displayData: string;
  readOnly: true;
}

export interface ILastModifiedByCell {
  type: CellType.LastModifiedBy;
  data: IUserInfo | null;
  displayData: string;
  readOnly: true;
}

export interface ILastModifiedTimeCell {
  type: CellType.LastModifiedTime;
  data: string | null;
  displayData: string;
  readOnly: true;
  options?: IDateTimeOptions;
}

export interface IAutoNumberCell {
  type: CellType.AutoNumber;
  data: number | null;
  displayData: string;
  readOnly: true;
}

export interface IIDCell {
  type: CellType.ID;
  data: string | number | null;
  displayData: string;
  readOnly: true;
}

export interface IButtonCell {
  type: CellType.Button;
  data: IButtonClickData | null;
  displayData: string;
  options: IButtonOptions;
}

export interface ICheckboxCell {
  type: CellType.Checkbox;
  data: boolean | null;
  displayData: string;
}

export interface IRollupCell {
  type: CellType.Rollup;
  data: string | number | boolean | null;
  displayData: string;
  readOnly: true;
  options: IRollupOptions;
}

export interface ILookupCell {
  type: CellType.Lookup;
  data: any[] | null;
  displayData: string;
  readOnly: true;
  options: ILookupOptions;
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
  | IListCell
  | ILinkCell
  | IUserCell
  | ICreatedByCell
  | ILastModifiedByCell
  | ILastModifiedTimeCell
  | IAutoNumberCell
  | IButtonCell
  | ICheckboxCell
  | IRollupCell
  | ILookupCell
  | IIDCell;
