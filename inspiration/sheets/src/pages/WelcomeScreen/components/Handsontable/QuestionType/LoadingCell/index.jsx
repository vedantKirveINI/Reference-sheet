import ODSLabel from "oute-ds-label";
import Skeleton from "oute-ds-skeleton";

// based on default cell content height
function LoadingCell({
	variant = "rounded",
	width = "100%",
	height = "20px",
	sx = {},
	shouldShowText = false,
	loadingText = "",
}) {
	if (shouldShowText) {
		return (
			<ODSLabel
				sx={{
					fontSize: "var(--cell-font-size)",
					fontFamily: "var(--tt-font-family)",
				}}
				color="#607D8B"
				variant="body"
				data-testid="loading-cell-text"
			>
				{loadingText}
			</ODSLabel>
		);
	}

	return (
		<Skeleton
			data-testid="loading-cell"
			variant={variant}
			width={width}
			height={height}
			sx={{
				borderRadius: "0.375rem",
				background:
					"linear-gradient(270deg, #F7F8F9 0%, #DDE5EA 50.67%, #F7F8F9 100%)",
				...sx,
			}}
		/>
	);
}

export default LoadingCell;
