import isEmpty from "lodash/isEmpty";
import startCase from "lodash/startCase";

export const showTooltipPopover = (
	event,
	fieldType,
	shouldFormat = true,
	additionalInfo = {},
) => {
	let popover = document.getElementById("tooltip-popover");

	if (!popover) {
		popover = document.createElement("div");
		popover.id = "tooltip-popover";
		popover.className = "tooltip-popover";
		popover.style.display = "block";
		popover.style.position = "absolute";
		popover.style.padding = "0.5rem 0.75rem";
		popover.style.fontSize = "0.75rem";
		popover.style.background = "rgba(38, 50, 56, 0.90)";
		popover.style.borderRadius = "0.375rem";
		popover.style.zIndex = "1000";
		popover.style.color = "#fff";
		popover.style.fontFamily = "Inter";
		popover.style.backdropFilter = "blur(0.125rem)";
		popover.style.maxWidth = "300px";
		popover.style.lineHeight = "1.4";
		popover.style.wordBreak = "break-word";
		document.body.appendChild(popover);
	}

	let content = "";

	if (!isEmpty(additionalInfo) && additionalInfo.name) {
		content = `<div style="margin-bottom: 0.35rem;">${additionalInfo.name}</div>`;
		if (additionalInfo.description) {
			content += `<div>Description: ${additionalInfo.description}</div>`;
		}
	} else {
		// Fallback to original behavior
		const val = shouldFormat
			? startCase(fieldType.toLowerCase())
			: fieldType;
		content = val;
	}

	popover.innerHTML = content;
	popover.style.top = `${event.pageY + 10}px`;
	popover.style.left = `${event.pageX + 10}px`;
};

export const hideTooltipPopover = () => {
	const popover = document.getElementById("tooltip-popover");
	if (popover) {
		popover.remove();
	}
};
