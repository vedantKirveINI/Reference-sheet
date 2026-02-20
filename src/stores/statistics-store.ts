import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum StatisticsFunction {
  None = "None",
  Count = "Count",
  Sum = "Sum",
  Average = "Average",
  Min = "Min",
  Max = "Max",
}

const STATISTICS_DISPLAY_NAMES: Record<StatisticsFunction, string> = {
  [StatisticsFunction.None]: "None",
  [StatisticsFunction.Count]: "Count",
  [StatisticsFunction.Sum]: "Sum",
  [StatisticsFunction.Average]: "Average",
  [StatisticsFunction.Min]: "Min",
  [StatisticsFunction.Max]: "Max",
};

const STATISTICS_ORDER: StatisticsFunction[] = [
  StatisticsFunction.None,
  StatisticsFunction.Count,
  StatisticsFunction.Sum,
  StatisticsFunction.Average,
  StatisticsFunction.Min,
  StatisticsFunction.Max,
];

export function getStatisticDisplayName(fn: StatisticsFunction): string {
  return STATISTICS_DISPLAY_NAMES[fn] ?? "None";
}

export function cycleStatisticFunction(
  current: StatisticsFunction
): StatisticsFunction {
  const currentIndex = STATISTICS_ORDER.indexOf(current);
  const nextIndex = (currentIndex + 1) % STATISTICS_ORDER.length;
  return STATISTICS_ORDER[nextIndex];
}

interface StatisticsMenuState {
  open: boolean;
  columnId: string | null;
  position: { x: number; y: number } | null;
}

interface StatisticsState {
  columnStatisticConfig: Record<string, StatisticsFunction>;
  statisticsMenu: StatisticsMenuState;

  setColumnStatistic: (columnId: string, fn: StatisticsFunction) => void;
  getColumnStatistic: (columnId: string) => StatisticsFunction;
  resetColumnStatistic: (columnId: string) => void;

  openStatisticsMenu: (
    columnId: string,
    position: { x: number; y: number }
  ) => void;
  closeStatisticsMenu: () => void;
}

export const useStatisticsStore = create<StatisticsState>()(
  persist(
    (set, get) => ({
      columnStatisticConfig: {},
      statisticsMenu: {
        open: false,
        columnId: null,
        position: null,
      },

      setColumnStatistic: (columnId, fn) =>
        set((state) => ({
          columnStatisticConfig: {
            ...state.columnStatisticConfig,
            [columnId]: fn,
          },
        })),

      getColumnStatistic: (columnId) => {
        return get().columnStatisticConfig[columnId] ?? StatisticsFunction.None;
      },

      resetColumnStatistic: (columnId) =>
        set((state) => {
          const { [columnId]: _, ...rest } = state.columnStatisticConfig;
          return { columnStatisticConfig: rest };
        }),

      openStatisticsMenu: (columnId, position) =>
        set({
          statisticsMenu: { open: true, columnId, position },
        }),

      closeStatisticsMenu: () =>
        set({
          statisticsMenu: { open: false, columnId: null, position: null },
        }),
    }),
    {
      name: "statistics-store",
      partialize: (state) => ({
        columnStatisticConfig: state.columnStatisticConfig,
      }),
    }
  )
);
