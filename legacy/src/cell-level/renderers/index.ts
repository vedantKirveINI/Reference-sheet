import { mcqRenderer } from "./mcq/McqRenderer";
import { numberRenderer } from "./number/NumberRenderer";
import { phoneNumberRenderer } from "./phoneNumber/PhoneNumberRenderer";
import { scqRenderer } from "./scq/ScqRenderer";
import { yesNoRenderer } from "./yesNo/YesNoRenderer";
import { stringRenderer } from "./string/StringRenderer";
import { zipCodeRenderer } from "./zipCode/ZipCodeRenderer";
import { currencyRenderer } from "./currency/CurrencyRenderer";
import { dropDownRenderer } from "./dropDown/DropDownRenderer";
import { addressRenderer } from "./address/AddressRenderer";
import { dateTimeRenderer } from "./dateTime/DateTimeRenderer";
import { createdTimeRenderer } from "./createdTime/CreatedTimeRenderer";
import { signatureRenderer } from "./signature/SignatureRenderer";
import { sliderRenderer } from "./slider/SliderRenderer";
import { fileUploadRenderer } from "./fileUpload/FileUploadRenderer";
import { timeRenderer } from "./time/TimeRenderer";
import { rankingRenderer } from "./ranking/RankingRenderer";
import { ratingRenderer } from "./rating/RatingRenderer";
import { opinionScaleRenderer } from "./opinion-scale/OpinionScaleRenderer";
import { enrichmentRenderer } from "./enrichment/EnrichmentRenderer";
import { listRenderer } from "./list/ListRenderer";
import { LoadingRenderer } from "./loading/LoadingRenderer";

// Export all cell renderers
export { stringRenderer } from "./string/StringRenderer";
export { numberRenderer } from "./number/NumberRenderer";
export { mcqRenderer } from "./mcq/McqRenderer";
export { scqRenderer } from "./scq/ScqRenderer";
export { yesNoRenderer } from "./yesNo/YesNoRenderer";
export { phoneNumberRenderer } from "./phoneNumber/PhoneNumberRenderer";
export { zipCodeRenderer } from "./zipCode/ZipCodeRenderer";
export { currencyRenderer } from "./currency/CurrencyRenderer";
export { dropDownRenderer } from "./dropDown/DropDownRenderer";
export { addressRenderer } from "./address/AddressRenderer";
export { dateTimeRenderer } from "./dateTime/DateTimeRenderer";
export { createdTimeRenderer } from "./createdTime/CreatedTimeRenderer";
export { signatureRenderer } from "./signature/SignatureRenderer";
export { sliderRenderer } from "./slider/SliderRenderer";
export { fileUploadRenderer } from "./fileUpload/FileUploadRenderer";
export { timeRenderer } from "./time/TimeRenderer";
export { rankingRenderer } from "./ranking/RankingRenderer";
export { ratingRenderer } from "./rating/RatingRenderer";
export { opinionScaleRenderer } from "./opinion-scale/OpinionScaleRenderer";
export { enrichmentRenderer } from "./enrichment/EnrichmentRenderer";
export { listRenderer } from "./list/ListRenderer";
export { LoadingRenderer } from "./loading/LoadingRenderer";

// Cell renderer registry
export const getCellRenderer = (cellType: string) => {
	switch (cellType) {
		case "String":
			return stringRenderer;
		case "Number":
			return numberRenderer;
		case "MCQ":
			return mcqRenderer;
		case "SCQ":
			return scqRenderer;
		case "YesNo":
			return yesNoRenderer;
		case "PhoneNumber":
			return phoneNumberRenderer;
		case "ZipCode":
			return zipCodeRenderer;
		case "Currency":
			return currencyRenderer;
		case "DropDown":
			return dropDownRenderer;
		case "Address":
			return addressRenderer;
		case "DateTime":
			return dateTimeRenderer;
		case "CreatedTime":
			return createdTimeRenderer;
		case "Signature":
			return signatureRenderer;
		case "Slider":
			return sliderRenderer;
		case "FileUpload":
			return fileUploadRenderer;
		case "Time":
			return timeRenderer;
		case "Ranking":
			return rankingRenderer;
		case "Rating":
			return ratingRenderer;
		case "OpinionScale":
			return opinionScaleRenderer;
		case "Enrichment":
			return enrichmentRenderer;
		case "List":
			return listRenderer;
		case "Loading":
			return LoadingRenderer;
		default:
			return stringRenderer; // Default to string renderer
	}
};
