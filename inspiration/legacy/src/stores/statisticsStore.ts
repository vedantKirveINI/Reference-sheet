import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum StatisticsFunction {
	None = "none",
	Sum = "sum",
	Average = "average",
	Min = "min",
	Max = "max",
}

interface IStatisticsMenuState {
	open: boolean;
	columnId: string | null;
	position: { x: number; y: number } | null;
}

interface IStatisticsState {
	columnStatisticConfig: Record<string, StatisticsFunction>;
	statisticsMenu: IStatisticsMenuState;
	setColumnStatistic: (columnId: string, func: StatisticsFunction) => void;
	getColumnStatistic: (columnId: string) => StatisticsFunction;
	resetColumnStatistic: (columnId: string) => void;
	openStatisticsMenu: (
		columnId: string,
		position: { x: number; y: number },
	) => void;
	closeStatisticsMenu: () => void;
}

const DEFAULT_STATISTIC = StatisticsFunction.Sum;
const INITIAL_MENU_STATE: IStatisticsMenuState = {
	open: false,
	columnId: null,
	position: null,
};

export const useStatisticsStore = create<IStatisticsState>()(
	persist(
		(set, get) => ({
			columnStatisticConfig: {},
			statisticsMenu: INITIAL_MENU_STATE,

			setColumnStatistic: (
				columnId: string,
				func: StatisticsFunction,
			) => {
				set((state) => ({
					columnStatisticConfig: {
						...state.columnStatisticConfig,
						[columnId]: func,
					},
				}));
			},

			getColumnStatistic: (columnId: string) => {
				return (
					get().columnStatisticConfig[columnId] || DEFAULT_STATISTIC
				);
			},

			resetColumnStatistic: (columnId: string) => {
				set((state) => {
					const newConfig = { ...state.columnStatisticConfig };
					delete newConfig[columnId];
					return { columnStatisticConfig: newConfig };
				});
			},

			openStatisticsMenu: (
				columnId: string,
				position: { x: number; y: number },
			) => {
				set({
					statisticsMenu: {
						open: true,
						columnId,
						position,
					},
				});
			},

			closeStatisticsMenu: () => {
				set({ statisticsMenu: INITIAL_MENU_STATE });
			},
		}),
		{
			name: "statistics-state",
			partialize: (state) => ({
				columnStatisticConfig: state.columnStatisticConfig,
			}),
		},
	),
);

const STATISTIC_CYCLE: Record<StatisticsFunction, StatisticsFunction> = {
	[StatisticsFunction.Sum]: StatisticsFunction.Average,
	[StatisticsFunction.Average]: StatisticsFunction.Min,
	[StatisticsFunction.Min]: StatisticsFunction.Max,
	[StatisticsFunction.Max]: StatisticsFunction.Sum,
	[StatisticsFunction.None]: StatisticsFunction.Sum,
};

export const cycleStatisticFunction = (
	current: StatisticsFunction,
): StatisticsFunction => {
	return STATISTIC_CYCLE[current] || DEFAULT_STATISTIC;
};

const STATISTIC_DISPLAY_NAMES: Record<StatisticsFunction, string> = {
	[StatisticsFunction.Sum]: "Sum",
	[StatisticsFunction.Average]: "Average",
	[StatisticsFunction.Min]: "Min",
	[StatisticsFunction.Max]: "Max",
	[StatisticsFunction.None]: "None",
};

export const getStatisticDisplayName = (func: StatisticsFunction): string => {
	return (
		STATISTIC_DISPLAY_NAMES[func] ||
		STATISTIC_DISPLAY_NAMES[DEFAULT_STATISTIC]
	);
};
