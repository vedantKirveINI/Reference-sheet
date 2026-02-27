function getSingleSelectCustomSx({
	popperMaxHeight = "18.75",
	applyBorder = false,
}) {
	const autocompleteSx = {
		width: "100%",
		"& .MuiInputBase-root": {
			background: "transparent",
			borderRadius: 0,
			padding: "0px 0px 0px 7.5px !important", // in px to maintain alignment across different screen sizes
		},

		"& .MuiTextField-root": {
			height: "100%",
		},

		"& .MuiInputBase-sizeSmall": {
			padding: "0rem 0rem 0rem 0.25rem !important",
		},

		"& .MuiChip-labelSmall": {
			lineHeight: "1.3125rem",
		},

		"& .MuiChip-sizeSmall": {
			height: "1.4375rem",
		},

		"& .MuiAutocomplete-input": {
			padding: "0.156rem 0.25rem 0.156rem 0.5rem !important",
		},

		"& .MuiOutlinedInput-root": {
			width: "auto",
			height: "100%",
			border: applyBorder ? "0.125rem solid #212121" : "none",

			...(applyBorder && {
				"&.Mui-focused .MuiOutlinedInput-notchedOutline": {
					borderColor: "transparent",
					borderWidth: "0",
				},

				"&:hover .MuiOutlinedInput-notchedOutline": {
					borderColor: "rgba(0, 0, 0, 0)",
				},

				"& .MuiOutlinedInput-notchedOutline": {
					borderColor: "rgba(0, 0, 0, 0)",
				},
			}),
		},
	};

	const popperSx = {
		zIndex: 999999,
		marginTop: "0.5rem !important",
		"& .MuiAutocomplete-paper": {
			boxShadow: "0px 6px 12px 0px rgba(122, 124, 141, 0.20) !important",
			borderRadius: "6px",
			border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
		},
	};

	const radioProps = {
		"&.Mui-checked": {
			color: "white",
		},
	};

	const radioLabelProps = {
		color: "inherit",
	};
	return {
		autocompleteSx,
		popperSx,
		radioProps,
		radioLabelProps,
	};
}

export default getSingleSelectCustomSx;
