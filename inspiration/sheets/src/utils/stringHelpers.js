import { FIELD_OPTIONS_MAPPING } from "../constants/fieldOptionsMapping";

function joinColumnName(text) {
	const jointSplitText = text.trim().split(" ").join("_");
	return jointSplitText;
}

function capitalizeFirstLetter(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function getKLargestElement(arr, k) {
	const priorityQueue = [];
	arr.forEach((ele) => {
		priorityQueue.push(ele);
	});
	arr.sort((a, b) => a - b);

	if (priorityQueue.length > k) {
		priorityQueue.splice(0, priorityQueue.length - k);
	}

	return priorityQueue;
}

const getFieldLabel = (input) => {
	const field = FIELD_OPTIONS_MAPPING.find((field) => field.value === input);
	return field ? field.label : "";
};

export {
	joinColumnName,
	capitalizeFirstLetter,
	getKLargestElement,
	getFieldLabel,
};
