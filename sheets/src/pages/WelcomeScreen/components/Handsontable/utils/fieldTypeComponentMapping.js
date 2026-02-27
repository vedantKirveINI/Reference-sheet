import AddressField from "../components/FieldType/AddressField";
import CreatedTimeField from "../components/FieldType/CreatedTimeField";
import CurrencyField from "../components/FieldType/CurrencyField";
import DateField from "../components/FieldType/DateField";
import DropdownStaticField from "../components/FieldType/DropdownStaticField";
import DynamicDropdownField from "../components/FieldType/DynamicDropdownField";
import FileUploadField from "../components/FieldType/FileUploadField";
import ListField from "../components/FieldType/ListField";
import MCQField from "../components/FieldType/MCQField";
import NumberField from "../components/FieldType/NumberField";
import PhoneNumberField from "../components/FieldType/PhoneNumberField";
import RankingField from "../components/FieldType/RankingField";
import RatingField from "../components/FieldType/RatingField";
import ScqField from "../components/FieldType/ScqField";
import SignatureField from "../components/FieldType/SignatureField";
import TextField from "../components/FieldType/TextField";
import TimeField from "../components/FieldType/TimeField";
import YesNoField from "../components/FieldType/YesNoField";
import ZipcodeField from "../components/FieldType/ZipcodeField";

const FIELD_TYPE_COMPONENT_MAP = {
	SHORT_TEXT: TextField,
	LONG_TEXT: TextField,
	NUMBER: NumberField,
	EMAIL: TextField,
	SCQ: ScqField,
	MCQ: MCQField,
	ADDRESS: AddressField,
	PHONE_NUMBER: PhoneNumberField,
	ZIP_CODE: ZipcodeField,
	FILE_PICKER: FileUploadField,
	DROP_DOWN_STATIC: DropdownStaticField,
	DATE: DateField,
	YES_NO: YesNoField,
	CURRENCY: CurrencyField,
	TIME: TimeField,
	SIGNATURE: SignatureField,
	DROP_DOWN: DynamicDropdownField,
	RANKING: RankingField,
	ENRICHMENT: TextField,
	CREATED_TIME: CreatedTimeField,
	RATING: RatingField,
	LIST: ListField,
};

export default FIELD_TYPE_COMPONENT_MAP;
