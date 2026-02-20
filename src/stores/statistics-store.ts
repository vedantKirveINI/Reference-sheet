import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum StatisticsFunction {
  None = "None",
  Count = "Count",
  Filled = "Filled",
  Empty = "Empty",
  PercentFilled = "% Filled",
  Unique = "Unique",
  Sum = "Sum",
  Average = "Average",
  Min = "Min",
  Max = "Max",
  Range = "Range",
  Median = "Median",
}

export function getStatisticDisplayName(fn: StatisticsFunction): string {
  return fn;
}

export function getAvailableFunctions(fieldType: string): StatisticsFunction[] {
  const universal: StatisticsFunction[] = [
    StatisticsFunction.None,
    StatisticsFunction.Count,
    StatisticsFunction.Filled,
    StatisticsFunction.Empty,
    StatisticsFunction.PercentFilled,
    StatisticsFunction.Unique,
  ];

  const numericTypes = new Set(["Number", "Currency", "Slider", "Rating", "OpinionScale"]);
  const dateTypes = new Set(["DateTime", "CreatedTime"]);

  if (numericTypes.has(fieldType)) {
    return [
      ...universal,
      StatisticsFunction.Sum,
      StatisticsFunction.Average,
      StatisticsFunction.Min,
      StatisticsFunction.Max,
      StatisticsFunction.Range,
      StatisticsFunction.Median,
    ];
  }

  if (dateTypes.has(fieldType)) {
    return [
      ...universal,
      StatisticsFunction.Min,
      StatisticsFunction.Max,
    ];
  }

  return universal;
}

interface StatisticsState {
  columnStatisticConfig: Record<string, StatisticsFunction>;
  hoveredColumnId: string | null;

  setColumnStatistic: (columnId: string, fn: StatisticsFunction) => void;
  getColumnStatistic: (columnId: string) => StatisticsFunction;
  resetColumnStatistic: (columnId: string) => void;
  setHoveredColumnId: (columnId: string | null) => void;
}

export const useStatisticsStore = create<StatisticsState>()(
  persist(
    (set, get) => ({
      columnStatisticConfig: {},
      hoveredColumnId: null,

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

      setHoveredColumnId: (columnId) => set({ hoveredColumnId: columnId }),
    }),
    {
      name: "statistics-store",
      partialize: (state) => ({
        columnStatisticConfig: state.columnStatisticConfig,
      }),
    }
  )
);

export function cycleStatisticFunction(
  current: StatisticsFunction
): StatisticsFunction {
  const order = Object.values(StatisticsFunction);
  const currentIndex = order.indexOf(current);
  const nextIndex = (currentIndex + 1) % order.length;
  return order[nextIndex];
}
