import AddressEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Address/AddressEditor";
import AddressRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Address/AddressRenderer";
import CreatedTimeRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/CreatedTime/CreatedTimeRenderer";
import CurrencyEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Currency/CurrencyEditor";
import CurrencyRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Currency/CurrencyRenderer";
import DateTimePickerEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/DateTimePicker/DateTimePickerEditor";
import DateTimePicker from "../pages/WelcomeScreen/components/Handsontable/QuestionType/DateTimePicker/DateTimePickerRenderer";
import DropDownEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/DropDown/DropDownEditor";
import DropDownRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/DropDown/DropDownRenderer";
import DropDownStaticEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/DropDownStatic/DropDownStaticEditor";
import DropDownStaticRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/DropDownStatic/DropDownStaticRenderer";
import CustomEmailEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Email/EmailEditor";
import EmailRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Email/EmailRenderer";
import { emailValidator } from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Email/Validator/emailValidator";
import EnrichmentRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Enrichment";
import FilePickerEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/FileUpload/FilePickerEditor";
import FilePickerRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/FileUpload/FilePickerRenderer";
import ListEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/List/ListEditor";
import ListRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/List/ListRenderer";
import McqEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Mcq/McqEditor";
import McqRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Mcq/McqRenderer";
import NumberRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Number/NumberRenderer";
import CustomNumberEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Number/NumerEditor";
import { numberValidator } from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Number/Validator";
import PhoneNumberEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/PhoneNumber/PhoneNumberEditor";
import PhoneNumberRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/PhoneNumber/PhoneNumberRenderer";
import RankingEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Ranking/RankingEditor";
import RankingRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Ranking/RankingRenderer";
import RatingEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Rating/RatingEditor";
import RatingRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Rating/RatingRenderer";
import ScqEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Scq/ScqEditor";
import ScqRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Scq/ScqRenderer";
import ShortTextRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/ShortText/ShortTextRenderer";
import CustomTextEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/ShortText/TextEditor";
import SignatureEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Signature/SignatureEditor";
import SignatureRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Signature/SignatureRenderer";
import CustomTimeEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Time/CustomTimeEditor";
import TimeRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/Time/TimeRenderer";
import YesNoEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/YesNo/YesNoEditor";
import YesNoRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/YesNo/YesNoRenderer";
import ZipCodeEditor from "../pages/WelcomeScreen/components/Handsontable/QuestionType/ZipCode/ZipCodeEditor";
import ZipCodeRenderer from "../pages/WelcomeScreen/components/Handsontable/QuestionType/ZipCode/ZipCodeRenderer";

const FIELD_TYPE_MAPPING = {
	ADDRESS: {
		editor: AddressEditor,
		renderer: AddressRenderer,
	},

	CURRENCY: {
		editor: CurrencyEditor,
		renderer: CurrencyRenderer,
	},

	DATE: {
		editor: DateTimePickerEditor,
		renderer: DateTimePicker,
	},

	DROP_DOWN: {
		editor: DropDownEditor,
		renderer: DropDownRenderer,
	},

	EMAIL: {
		editor: CustomEmailEditor,
		renderer: EmailRenderer,
		validator: emailValidator,
	},

	FILE_PICKER: {
		editor: FilePickerEditor,
		renderer: FilePickerRenderer,
	},

	LONG_TEXT: {
		editor: CustomTextEditor,
		renderer: ShortTextRenderer,
	},

	MCQ: {
		editor: McqEditor,
		renderer: McqRenderer,
	},

	NUMBER: {
		renderer: NumberRenderer,
		editor: CustomNumberEditor,
		validator: numberValidator,
		// type: "numeric",
	},

	PHONE_NUMBER: {
		editor: PhoneNumberEditor,
		renderer: PhoneNumberRenderer,
	},

	SCQ: {
		editor: ScqEditor,
		renderer: ScqRenderer,
	},

	SHORT_TEXT: {
		editor: CustomTextEditor,
		renderer: ShortTextRenderer,
	},

	YES_NO: {
		editor: YesNoEditor,
		renderer: YesNoRenderer,
	},

	ZIP_CODE: {
		editor: ZipCodeEditor,
		renderer: ZipCodeRenderer,
	},

	TIME: {
		editor: CustomTimeEditor,
		renderer: TimeRenderer,
	},

	DROP_DOWN_STATIC: {
		editor: DropDownStaticEditor,
		renderer: DropDownStaticRenderer,
	},

	UNKNOWN: {
		editor: CustomTextEditor,
		renderer: ShortTextRenderer,
		readOnly: true,
	},

	SIGNATURE: {
		editor: SignatureEditor,
		renderer: SignatureRenderer,
	},

	RANKING: {
		editor: RankingEditor,
		renderer: RankingRenderer,
	},

	ENRICHMENT: {
		readOnly: true,
		editor: CustomTextEditor,
		renderer: EnrichmentRenderer,
	},

	LIST: {
		editor: ListEditor,
		renderer: ListRenderer,
	},
	CREATED_TIME: {
		renderer: CreatedTimeRenderer,
		readOnly: true,
	},

	RATING: {
		editor: RatingEditor,
		renderer: RatingRenderer,
	},
};

export { FIELD_TYPE_MAPPING };
