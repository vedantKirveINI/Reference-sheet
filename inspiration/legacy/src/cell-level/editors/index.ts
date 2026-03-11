import { McqEditor } from "./mcq/McqEditor";
import { NumberEditor } from "./number/NumberEditor";
import { PhoneNumberEditor } from "./phoneNumber/PhoneNumberEditor";
import { ScqEditor } from "./scq/ScqEditor";
import { YesNoEditor } from "./yesNo/YesNoEditor";
import { StringEditor } from "./string/StringEditor";
import { ZipCodeEditor } from "./zipCode/ZipCodeEditor";
import { CurrencyEditor } from "./currency/CurrencyEditor";
import { DropDownEditor } from "./dropDown/DropDownEditor";
import { AddressEditor } from "./address/AddressEditor";
import { SignatureEditor } from "./signature/SignatureEditor";
import { SliderEditor } from "./slider/SliderEditor";
import { FileUploadEditor } from "./fileUpload/FileUploadEditor";
import { TimeEditor } from "./time/TimeEditor";
import { RankingEditor } from "./ranking/RankingEditor";
import { DateTimeEditor } from "./dateTime/DateTimeEditor";
import { RatingEditor } from "./rating/RatingEditor";
import { OpinionScaleEditor } from "./opinion-scale/OpinionScaleEditor";
import { ListEditor } from "./list/ListEditor";

// Editor registry
export const getEditor = (cellType: string) => {
	switch (cellType) {
		case "String":
			return StringEditor;
		case "Number":
			return NumberEditor;
		case "MCQ":
			return McqEditor;
		case "SCQ":
			return ScqEditor;
		case "YesNo":
			return YesNoEditor;
		case "PhoneNumber":
			return PhoneNumberEditor;
		case "ZipCode":
			return ZipCodeEditor;
		case "Currency":
			return CurrencyEditor;
		case "DropDown":
			return DropDownEditor;
		case "Address":
			return AddressEditor;
		case "Signature":
			return SignatureEditor;
		case "Slider":
			return SliderEditor;
		case "FileUpload":
			return FileUploadEditor;
		case "Time":
			return TimeEditor;
		case "Ranking":
			return RankingEditor;
		case "DateTime":
			return DateTimeEditor;
		case "Rating":
			return RatingEditor;
		case "OpinionScale":
			return OpinionScaleEditor;
		case "List":
			return ListEditor;
		default:
			return StringEditor; // Default to string editor
	}
};
