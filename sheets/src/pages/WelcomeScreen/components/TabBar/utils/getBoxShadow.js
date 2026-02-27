export const getBoxShadow = ({
	showRightArrow = false,
	showLeftArrow = false,
}) => {
	let boxShadow = [];
	if (showRightArrow) {
		boxShadow.push("inset -15px 0px 16px -14px rgba(0, 0, 0, 0.5)");
	}

	if (showLeftArrow) {
		boxShadow.push("inset 15px 0px 16px -16px rgba(0, 0, 0, 0.5)");
	}

	return boxShadow.join(",");
};
