const SCQ_COLOURS: readonly string[] = [
	"#DDC1FF",
	"#C1F4FF",
	"#C1D6FF",
	"#FFC1F5",
	"#C1FFE1",
	"#FFC1C1",
] as const;

const MCQ_COLOURS: readonly string[] = [
	"#FFC2C2",
	"#FFEAC2",
	"#D6FFC2",
	"#C2FFF8",
	"#C2CFFF",
	"#D9C2FF",
	"#FFC2FD",
	"#FFC2D4",
	"#C2FFDE",
	"#B6B6B6",
] as const;

const YES_NO_COLOUR_MAPPING: Record<string, string> = {
	Yes: "#CAFFC1",
	No: "#FFC1C1",
	Other: "#CFD8DC",
} as const;

const DEFAULT_COLOUR: string = "#CFD8DC";

export { SCQ_COLOURS, YES_NO_COLOUR_MAPPING, DEFAULT_COLOUR, MCQ_COLOURS };
