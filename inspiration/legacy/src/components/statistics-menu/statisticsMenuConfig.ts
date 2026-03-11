import { StatisticsFunction } from "@/stores/statisticsStore";

export interface IStatisticConfig {
	id: StatisticsFunction;
	label: string;
	description?: string;
	iconName?: string;
	available: boolean;
	category?: "basic" | "advanced" | "counting";
}

export const STATISTICS_CONFIG: Record<StatisticsFunction, IStatisticConfig> = {
	[StatisticsFunction.None]: {
		id: StatisticsFunction.None,
		label: "None",
		description: "Hide statistics",
		available: true,
		category: "basic",
	},
	[StatisticsFunction.Sum]: {
		id: StatisticsFunction.Sum,
		label: "Sum",
		description: "Sum of all values",
		available: true,
		category: "basic",
	},
	[StatisticsFunction.Average]: {
		id: StatisticsFunction.Average,
		label: "Average",
		description: "Average of all values",
		available: true,
		category: "basic",
	},
	[StatisticsFunction.Min]: {
		id: StatisticsFunction.Min,
		label: "Min",
		description: "Minimum value",
		available: true,
		category: "basic",
	},
	[StatisticsFunction.Max]: {
		id: StatisticsFunction.Max,
		label: "Max",
		description: "Maximum value",
		available: true,
		category: "basic",
	},
};

const CATEGORY_ORDER: Array<"basic" | "advanced" | "counting"> = [
	"basic",
	"advanced",
	"counting",
];

export const getOrderedStatistics = (): IStatisticConfig[] => {
	const ordered = CATEGORY_ORDER.flatMap((category) =>
		Object.values(STATISTICS_CONFIG).filter(
			(config) =>
				config.category === category &&
				config.available &&
				config.id !== StatisticsFunction.None,
		),
	);

	return [STATISTICS_CONFIG[StatisticsFunction.None], ...ordered];
};

export const getStatisticConfig = (
	id: StatisticsFunction,
): IStatisticConfig | undefined => STATISTICS_CONFIG[id];

export const isStatisticAvailable = (id: StatisticsFunction): boolean =>
	STATISTICS_CONFIG[id]?.available ?? false;
