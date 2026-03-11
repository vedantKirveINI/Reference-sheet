import { useMemo } from "react";

const getTextWidth = (text: string): number => {
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	if (!ctx) return 0;
	ctx.font = "13px Inter";
	const letterSpacing = 0.25;
	return ctx.measureText(text).width + letterSpacing * text.length;
};

const getChipWidth = (text: string): number => {
	const padding = 16; // 8px on each side
	return getTextWidth(text) + padding;
};

interface UseChipWidthProps {
	value: string | null;
	availableWidth: number;
	wrapClass: string;
}

export const useChipWidth = ({
	value,
	availableWidth,
	wrapClass,
}: UseChipWidthProps) => {
	return useMemo(() => {
		if (!value) {
			return {
				borderRadius: 16,
				shouldWrap: false,
			};
		}

		const chipWidth = getChipWidth(value);
		const isWrapped = wrapClass === "wrap";
		const shouldWrap = isWrapped && chipWidth > availableWidth;

		return {
			borderRadius: shouldWrap ? 4 : 16,
			shouldWrap,
		};
	}, [value, availableWidth, wrapClass]);
};


