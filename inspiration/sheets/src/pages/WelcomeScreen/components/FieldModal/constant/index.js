import AddressField from "../../FieldModalOptions/QuestionType/AddressField";
import CreatedTimeField from "../../FieldModalOptions/QuestionType/CreatedTimeField";
import CurrencyField from "../../FieldModalOptions/QuestionType/CurrencyField";
import DateField from "../../FieldModalOptions/QuestionType/DateField";
import DropdownField from "../../FieldModalOptions/QuestionType/DropdownField";
import DropdownStaticField from "../../FieldModalOptions/QuestionType/DropdownStaticField";
import EmailField from "../../FieldModalOptions/QuestionType/EmailField";
import EnrichmentField from "../../FieldModalOptions/QuestionType/EnrichmentField";
import FileUploadField from "../../FieldModalOptions/QuestionType/FileUploadField";
import ListField from "../../FieldModalOptions/QuestionType/ListField";
import McqField from "../../FieldModalOptions/QuestionType/McqField";
import NumberField from "../../FieldModalOptions/QuestionType/NumberField";
import PhoneNumberField from "../../FieldModalOptions/QuestionType/PhoneNumberField";
import RankingField from "../../FieldModalOptions/QuestionType/RankingField";
import RatingField from "../../FieldModalOptions/QuestionType/RatingField";
import ScqField from "../../FieldModalOptions/QuestionType/ScqField";
import SignatureField from "../../FieldModalOptions/QuestionType/Signature";
import TextField from "../../FieldModalOptions/QuestionType/TextField";
import TimeField from "../../FieldModalOptions/QuestionType/TimeField";
import YesNoField from "../../FieldModalOptions/QuestionType/YesNoField";
import ZipCodeField from "../../FieldModalOptions/QuestionType/ZipCodeField";

const CREATE_FIELD_MAPPING = {
	ADDRESS: AddressField,
	SHORT_TEXT: TextField,
	LONG_TEXT: TextField,
	NUMBER: NumberField,
	EMAIL: EmailField,
	SCQ: ScqField,
	MCQ: McqField,
	LIST: ListField,
	DROP_DOWN: DropdownField,
	DROP_DOWN_STATIC: DropdownStaticField,
	YES_NO: YesNoField,
	DATE: DateField,
	TIME: TimeField,
	CURRENCY: CurrencyField,
	PHONE_NUMBER: PhoneNumberField,
	FILE_PICKER: FileUploadField,
	ZIP_CODE: ZipCodeField,
	SIGNATURE: SignatureField,
	RANKING: RankingField,
	ENRICHMENT: EnrichmentField,
	CREATED_TIME: CreatedTimeField,
	RATING: RatingField,
};

const IGNORE_KEYS_UPDATE_FIELD_PAYLOAD = [
	"id",
	"cellValueType",
	"createdTime",
	"deletedTime",
	"lastModifiedTime",
	"nodeId",
	"order",
	"source_id",
	"status",
	"tableMetaId",
	"dbFieldType",
	"dbFieldName",
	"computedFieldMeta",
	"hasError",
	"formula",
	"options",
];

const ALLOWED_FIELD_TYPES_WITH_OPTIONS = [
	"SCQ",
	"MCQ",
	"DROP_DOWN",
	"DROP_DOWN_STATIC",
	"RANKING",
];

export {
	CREATE_FIELD_MAPPING,
	IGNORE_KEYS_UPDATE_FIELD_PAYLOAD,
	ALLOWED_FIELD_TYPES_WITH_OPTIONS,
};
