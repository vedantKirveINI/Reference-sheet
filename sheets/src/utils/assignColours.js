import {
	SCQ_COLOURS,
	MCQ_COLOURS,
	DEFAULT_COLOUR,
	YES_NO_COLOUR_MAPPING,
} from "../constants/colours";
import YES_NO_OPTIONS from "../constants/yesNoOptions";

const COLOUR_MAPPINGS = {
	mcq: MCQ_COLOURS,
	scq: SCQ_COLOURS,
	dropdown: SCQ_COLOURS,
};

function getYesNoColours() {
	const colourMapping = {};

	YES_NO_OPTIONS.forEach((option) => {
		colourMapping[option.value] =
			YES_NO_COLOUR_MAPPING[option.label] || DEFAULT_COLOUR;
	});

	return colourMapping;
}

function getAssignedColours(options = [], isScq = true) {
	const colourMapping = {};
	const coloursList = isScq ? SCQ_COLOURS : MCQ_COLOURS;

	options.forEach((option, index) => {
		const key =
			typeof option === "object" && option !== null
				? option?.name
				: option;

		if (key) {
			const colour = coloursList[index % coloursList.length];
			colourMapping[option] = colour;
		}
	});

	return colourMapping;
}

const getChipsColor = ({ index, type = "mcq" }) => {
	const colorList = COLOUR_MAPPINGS?.[type] || DEFAULT_COLOUR;

	return colorList[index % colorList.length];
};

export { getAssignedColours, getYesNoColours, getChipsColor };
