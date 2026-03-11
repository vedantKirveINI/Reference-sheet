// Modern design tokens for grouping
// Eye-pleasing, modern UI with better visual hierarchy

// Group header height (optimized for readability and modern look)
export const GROUP_HEADER_HEIGHT = 56;

// Group header colors with purple tint (matching grouped column theme)
// More distinct shades for better visibility when multiple grouping levels are applied
export const GROUP_HEADER_COLORS = {
	depth0: "#f7f5ff", // Primary group - lightest purple tint (subtle, matches grouped column theme)
	depth1: "#e9e5ff", // Nested group - medium purple (more visible for second level)
	depth2: "#ddd6fe", // Further nested - darker purple (most visible for third level)
};

// Airtable-exact grouped column background color (subtle tint to indicate grouping)
// Applied to column headers and cells in columns that are used for grouping
export const GROUP_COLUMN_BG = "#f2f0fe"; // Light purple/lavender tint for grouped columns (matches GroupBy button theme)

// Airtable-exact text colors (matching Airtable's typography)
export const GROUP_TEXT_COLOR = {
	primary: "#1a1d23", // Very dark for value text (Airtable exact - high contrast)
	value: "#1a1d23", // Same dark color for value to match Airtable
	secondary: "#9ca3af", // Lighter for item count (Airtable exact)
	accent: "#6b7280", // Medium gray for field name label (Airtable exact)
};

// Airtable-exact border colors (extremely subtle, matching Airtable)
export const GROUP_BORDER_COLOR = {
	primary: "#e5e7eb", // Main border (Airtable exact - very subtle)
	subtle: "#f3f4f6", // Subtle divider (Airtable exact)
};

// Modern chevron icons (will be drawn as SVG paths)
// Using better Unicode characters that look more modern
export const GROUP_ICONS = {
	collapsed: "▶", // Right chevron (will be replaced with path drawing)
	expanded: "▼", // Down chevron (will be replaced with path drawing)
};

// Airtable-exact chevron icon drawing (matching Airtable's chevron design precisely)
export const drawChevronIcon = (
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	size: number,
	isCollapsed: boolean,
	color: string = "#6b7280", // Airtable exact medium gray
) => {
	ctx.save();
	ctx.strokeStyle = color;
	ctx.fillStyle = color;
	ctx.lineWidth = 2; // Airtable exact line width (slightly thinner for cleaner look)
	ctx.lineCap = "round";
	ctx.lineJoin = "round";

	const centerX = x + size / 2;
	const centerY = y + size / 2;
	const arrowSize = size * 0.35; // 35% of icon size (Airtable exact proportions)

	ctx.beginPath();
	if (isCollapsed) {
		// Right chevron (collapsed) - Airtable exact
		ctx.moveTo(centerX - arrowSize / 2.5, centerY - arrowSize / 2);
		ctx.lineTo(centerX + arrowSize / 2.5, centerY);
		ctx.lineTo(centerX - arrowSize / 2.5, centerY + arrowSize / 2);
	} else {
		// Down chevron (expanded) - Airtable exact
		ctx.moveTo(centerX - arrowSize / 2, centerY - arrowSize / 2.5);
		ctx.lineTo(centerX, centerY + arrowSize / 2.5);
		ctx.lineTo(centerX + arrowSize / 2, centerY - arrowSize / 2.5);
	}
	ctx.stroke();
	ctx.restore();
};

// Airtable-exact spacing (matching Airtable's padding precisely)
export const GROUP_HEADER_PADDING = {
	horizontal: 16, // Airtable exact horizontal padding
	vertical: 12, // Airtable exact vertical spacing
	iconSpacing: 12, // Airtable exact space between icon and text
	fieldValueGap: 3, // Airtable exact gap between field name and value
};

// Airtable-exact typography with stacked layout hierarchy
export const GROUP_HEADER_FONT = {
	family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
	size: 11, // Airtable exact field name size (slightly smaller)
	sizeValue: 14, // Airtable exact value size (larger and bold)
	sizeCount: 11, // Airtable exact item count text size
	weight: 400, // Airtable exact regular weight for field name
	weightValue: 600, // Airtable exact semi-bold weight for value
	weightCount: 400, // Airtable exact regular weight for count text
	lineHeight: 1.4, // Airtable exact line spacing for stacked layout
	fieldValueGap: 3, // Airtable exact vertical gap between field name and value
};

// Airtable-exact visual effects (matching Airtable's subtle styling)
export const GROUP_HEADER_EFFECTS = {
	shadow: {
		offsetX: 0,
		offsetY: 0.5, // Airtable exact shadow offset (very subtle)
		blur: 1, // Airtable exact blur (minimal)
		color: "rgba(0, 0, 0, 0.03)", // Airtable exact shadow color (extremely subtle)
	},
	hover: {
		opacity: 0.98, // Airtable exact hover opacity (very subtle change)
	},
};
