function getCustomSx({ popperMaxHeight = "18.75", applyBorder = false }) {
	const autocompleteSx = {
		"&.MuiAutocomplete-root": {
			minWidth: "100%",
			width: "100%",
		},

		"& .MuiInputBase-root": {
			borderRadius: 0,
		},

		"& .MuiTextField-root": {
			height: "100%",
		},

		"& .MuiInputBase-sizeSmall": {
			paddingBottom: "0rem !important",
		},

		"& .MuiOutlinedInput-root": {
			width: "auto",
			height: "100%",
			padding: " 0rem 0.25rem !important",
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
		// maxHeight: `${popperMaxHeight}rem`,
		borderRadius: "0.75rem",
		// overflowY: "auto",
		border: "0.0469rem solid #CFD8DC",
		boxShadow: "0rem 0.375rem 0.75rem 0rem rgba(122, 124, 141, 0.20)",
	};

	const chipSx = {
		maxWidth: "80%",
		backgroundColor: "#DDC1FF",
		"& .MuiChip-label": {
			fontSize: "0.875rem",
			padding: "0rem",
		},
	};

	const iconSx = {
		color: "#607D8B",
		width: "0.9375rem",
		height: "0.9375rem",
		cursor: "pointer",
	};

	const checkboxSx = {
		"& .MuiSvgIcon-root": { fontSize: "1.125rem" },
		"&.Mui-checked": {
			color: "white",
		},
	};

	return {
		autocompleteSx,
		popperSx,
		chipSx,
		iconSx,
		checkboxSx,
	};
}

export default getCustomSx;
