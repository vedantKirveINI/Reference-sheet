import Handsontable from "handsontable";

import AddressEditor from "../QuestionType/Address/AddressEditor";
import AddressRenderer from "../QuestionType/Address/AddressRenderer";
import CurrencyEditor from "../QuestionType/Currency/CurrencyEditor";
import CurrencyRenderer from "../QuestionType/Currency/CurrencyRenderer";
import CustomDateEditor from "../QuestionType/Date/CustomDateEditor";
import DateRenderer from "../QuestionType/Date/DateRenderer";
import DropDownEditor from "../QuestionType/DropDown/DropDownEditor";
import DropDownRenderer from "../QuestionType/DropDown/DropDownRenderer";
import DropDownStaticEditor from "../QuestionType/DropDownStatic/DropDownStaticEditor";
import DropDownStaticRenderer from "../QuestionType/DropDownStatic/DropDownStaticRenderer";
import CustomEmailEditor from "../QuestionType/Email/EmailEditor";
import EmailRenderer from "../QuestionType/Email/EmailRenderer";
import FilePickerEditor from "../QuestionType/FileUpload/FilePickerEditor";
import FilePickerRenderer from "../QuestionType/FileUpload/FilePickerRenderer";
import McqEditor from "../QuestionType/Mcq/McqEditor";
import McqRenderer from "../QuestionType/Mcq/McqRenderer";
import NumberRenderer from "../QuestionType/Number/NumberRenderer";
import CustomNumberEditor from "../QuestionType/Number/NumerEditor";
import PhoneNumberEditor from "../QuestionType/PhoneNumber/PhoneNumberEditor";
import PhoneNumberRenderer from "../QuestionType/PhoneNumber/PhoneNumberRenderer";
import RankingEditor from "../QuestionType/Ranking/RankingEditor";
import RankingRenderer from "../QuestionType/Ranking/RankingRenderer";
import ScqEditor from "../QuestionType/Scq/ScqEditor";
import ScqRenderer from "../QuestionType/Scq/ScqRenderer";
import ShortTextRenderer from "../QuestionType/ShortText/ShortTextRenderer";
import CustomTextEditor from "../QuestionType/ShortText/TextEditor";
import SignatureEditor from "../QuestionType/Signature/SignatureEditor";
import SignatureRenderer from "../QuestionType/Signature/SignatureRenderer";
import CustomTimeEditor from "../QuestionType/Time/CustomTimeEditor";
import TimeRenderer from "../QuestionType/Time/TimeRenderer";
import YesNoEditor from "../QuestionType/YesNo/YesNoEditor";
import YesNoRenderer from "../QuestionType/YesNo/YesNoRenderer";
import ZipCodeEditor from "../QuestionType/ZipCode/ZipCodeEditor";
import ZipCodeRenderer from "../QuestionType/ZipCode/ZipCodeRenderer";

const RENDERS_MAPPING = [
	{ name: "customShortText", handler: ShortTextRenderer },
	{ name: "customNumber", handler: NumberRenderer },
	{ name: "customDropDown", handler: DropDownRenderer },
	{ name: "customCurrency", handler: CurrencyRenderer },
	{ name: "customPhoneNumber", handler: PhoneNumberRenderer },
	{ name: "customEmail", handler: EmailRenderer },
	{ name: "customYesNo", handler: YesNoRenderer },
	{ name: "customZipCode", handler: ZipCodeRenderer },
	{ name: "customDateRenderer", handler: DateRenderer },
	{ name: "customFilePicker", handler: FilePickerRenderer },
	{ name: "customMcq", handler: McqRenderer },
	{ name: "customDropdownStatic", handler: DropDownStaticRenderer },
	{ name: "customScq", handler: ScqRenderer },
	{ name: "customAddress", handler: AddressRenderer },
	{ name: "customTime", handler: TimeRenderer },
	{ name: "customSignature", handler: SignatureRenderer },
	{ name: "customRanking", handler: RankingRenderer },
];

const EDITORS_MAPPING = [
	{
		name: "customShortTextEditor",
		handler: CustomTextEditor,
	},
	{
		name: "customEmailEditor",
		handler: CustomEmailEditor,
	},
	{
		name: "customNumberEditor",
		handler: CustomNumberEditor,
	},
	{
		name: "customPhoneNumberEditor",
		handler: PhoneNumberEditor,
	},
	{
		name: "customScqEditor",
		handler: ScqEditor,
	},
	{
		name: "customMcqEditor",
		handler: McqEditor,
	},
	{
		name: "customDropdownStaticEditor",
		handler: DropDownStaticEditor,
	},
	{
		name: "customDropDownEditor",
		handler: DropDownEditor,
	},
	{
		name: "customCurrencyEditor",
		handler: CurrencyEditor,
	},
	{
		name: "customYesNoEditor",
		handler: YesNoEditor,
	},
	{
		name: "customZipCodeEditor",
		handler: ZipCodeEditor,
	},
	{
		name: "customFilePickerEditor",
		handler: FilePickerEditor,
	},
	{
		name: "customDateEditor",
		handler: CustomDateEditor,
	},
	{
		name: "customAddressEditor",
		handler: AddressEditor,
	},
	{
		name: "customTimeEditor",
		handler: CustomTimeEditor,
	},
	{
		name: "customSignatureEditor",
		handler: SignatureEditor,
	},
	{
		name: "customRankingEditor",
		handler: RankingEditor,
	},
];

function registerHotModules() {
	function registerRenderers(renderers) {
		renderers.forEach((renderer) => {
			Handsontable.renderers.registerRenderer(
				renderer.name,
				renderer.handler,
			);
		});
	}

	function registerEditors(editors) {
		editors.forEach((editor) => {
			Handsontable.editors.registerEditor(editor.name, editor.handler);
		});
	}

	registerRenderers(RENDERS_MAPPING);
	registerEditors(EDITORS_MAPPING);
}

export { registerHotModules };
