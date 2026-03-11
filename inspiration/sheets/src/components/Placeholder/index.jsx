import ODSLabel from "oute-ds-label";

function Placeholder({
	value = "",
	color = "#CFD8DC",
	sx = {},
	variant = "subtitle1",
}) {
	return (
		<ODSLabel
			variant={variant}
			sx={{
				fontFamily: "Inter",
				...sx,
			}}
			color={color}
		>
			{value}
		</ODSLabel>
	);
}

export default Placeholder;
