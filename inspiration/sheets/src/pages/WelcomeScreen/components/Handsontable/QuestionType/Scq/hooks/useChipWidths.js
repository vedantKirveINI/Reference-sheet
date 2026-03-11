function getChipWidth({ text = "" }) {
	const textWidth = getTextWidth({ text });

	// 1rem = 16px padding
	return +(textWidth + 16).toFixed(2);
}

function getTextWidth({
	text = "",
	fontSize = 13, // 0.8125rem = 13px
	fontFamily = "Inter",
	letterSpacing = 0.25, // 0.0156rem = ~0.25px
}) {
	const canvas = document.createElement("canvas");
	const context = canvas.getContext("2d");

	context.font = `${fontSize}px ${fontFamily}`;

	const textWidth =
		context.measureText(text).width + letterSpacing * text.length;

	return +textWidth.toFixed(2);
}

function shouldWrapChip({ text = "", availableWidth = 0, isWrapped = false }) {
	const chipWidth = getChipWidth({ text });

	return isWrapped && chipWidth > availableWidth;
}

const useChipWidths = ({
	selectionValue = "",
	availableWidth = 0,
	wrapValue = "",
}) => {
	if (!selectionValue) {
		return "";
	}

	const isWrapped = wrapValue === "wrap";

	const shouldWrap = shouldWrapChip({
		text: selectionValue,
		availableWidth,
		isWrapped,
	});

	const borderRadius = shouldWrap ? "4px" : "16px";

	const chipWidth = getChipWidth({
		text: selectionValue,
	});

	return { chipWidth, borderRadius };
};

export default useChipWidths;
