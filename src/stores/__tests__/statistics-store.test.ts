import { describe, it, expect, beforeEach } from 'vitest';
import {
  useStatisticsStore,
  StatisticsFunction,
  getStatisticDisplayName,
  getAvailableFunctions,
  cycleStatisticFunction,
} from '../statistics-store';

function resetStore() {
  useStatisticsStore.setState({ columnStatisticConfig: {} });
}

describe('useStatisticsStore', () => {
  beforeEach(resetStore);

  describe('initial state', () => {
    it('has empty columnStatisticConfig', () => {
      expect(useStatisticsStore.getState().columnStatisticConfig).toEqual({});
    });
  });

  describe('setColumnStatistic', () => {
    it('sets a statistic for a column', () => {
      useStatisticsStore.getState().setColumnStatistic('col-1', StatisticsFunction.Sum);
      expect(useStatisticsStore.getState().columnStatisticConfig['col-1']).toBe(StatisticsFunction.Sum);
    });

    it('overwrites previous value', () => {
      useStatisticsStore.getState().setColumnStatistic('col-1', StatisticsFunction.Sum);
      useStatisticsStore.getState().setColumnStatistic('col-1', StatisticsFunction.Average);
      expect(useStatisticsStore.getState().columnStatisticConfig['col-1']).toBe(StatisticsFunction.Average);
    });

    it('preserves other column configs', () => {
      useStatisticsStore.getState().setColumnStatistic('col-1', StatisticsFunction.Sum);
      useStatisticsStore.getState().setColumnStatistic('col-2', StatisticsFunction.Count);
      expect(useStatisticsStore.getState().columnStatisticConfig['col-1']).toBe(StatisticsFunction.Sum);
    });
  });

  describe('getColumnStatistic', () => {
    it('returns configured statistic', () => {
      useStatisticsStore.getState().setColumnStatistic('col-1', StatisticsFunction.Max);
      expect(useStatisticsStore.getState().getColumnStatistic('col-1')).toBe(StatisticsFunction.Max);
    });

    it('returns None for unconfigured column', () => {
      expect(useStatisticsStore.getState().getColumnStatistic('unknown')).toBe(StatisticsFunction.None);
    });
  });

  describe('resetColumnStatistic', () => {
    it('removes the config for a column', () => {
      useStatisticsStore.getState().setColumnStatistic('col-1', StatisticsFunction.Sum);
      useStatisticsStore.getState().resetColumnStatistic('col-1');
      expect(useStatisticsStore.getState().columnStatisticConfig['col-1']).toBeUndefined();
    });

    it('does not affect other columns', () => {
      useStatisticsStore.getState().setColumnStatistic('col-1', StatisticsFunction.Sum);
      useStatisticsStore.getState().setColumnStatistic('col-2', StatisticsFunction.Count);
      useStatisticsStore.getState().resetColumnStatistic('col-1');
      expect(useStatisticsStore.getState().columnStatisticConfig['col-2']).toBe(StatisticsFunction.Count);
    });
  });
});

describe('getStatisticDisplayName', () => {
  it('returns the function value itself', () => {
    expect(getStatisticDisplayName(StatisticsFunction.Count)).toBe('Count');
    expect(getStatisticDisplayName(StatisticsFunction.PercentFilled)).toBe('% Filled');
  });
});

describe('getAvailableFunctions', () => {
  const universal = [
    StatisticsFunction.None,
    StatisticsFunction.Count,
    StatisticsFunction.Filled,
    StatisticsFunction.Empty,
    StatisticsFunction.PercentFilled,
    StatisticsFunction.Unique,
  ];

  it('returns universal functions for text field', () => {
    expect(getAvailableFunctions('Text')).toEqual(universal);
  });

  it('returns universal + numeric functions for Number', () => {
    const result = getAvailableFunctions('Number');
    expect(result).toEqual([
      ...universal,
      StatisticsFunction.Sum,
      StatisticsFunction.Average,
      StatisticsFunction.Min,
      StatisticsFunction.Max,
      StatisticsFunction.Range,
      StatisticsFunction.Median,
    ]);
  });

  it('returns numeric functions for Currency', () => {
    expect(getAvailableFunctions('Currency')).toContain(StatisticsFunction.Sum);
  });

  it('returns numeric functions for Slider', () => {
    expect(getAvailableFunctions('Slider')).toContain(StatisticsFunction.Average);
  });

  it('returns numeric functions for Rating', () => {
    expect(getAvailableFunctions('Rating')).toContain(StatisticsFunction.Median);
  });

  it('returns numeric functions for OpinionScale', () => {
    expect(getAvailableFunctions('OpinionScale')).toContain(StatisticsFunction.Range);
  });

  it('returns universal + min/max for DateTime', () => {
    const result = getAvailableFunctions('DateTime');
    expect(result).toEqual([...universal, StatisticsFunction.Min, StatisticsFunction.Max]);
  });

  it('returns universal + min/max for CreatedTime', () => {
    const result = getAvailableFunctions('CreatedTime');
    expect(result).toContain(StatisticsFunction.Min);
    expect(result).toContain(StatisticsFunction.Max);
    expect(result).not.toContain(StatisticsFunction.Sum);
  });
});

describe('cycleStatisticFunction', () => {
  it('cycles from None to next function', () => {
    const result = cycleStatisticFunction(StatisticsFunction.None);
    expect(result).toBe(StatisticsFunction.Count);
  });

  it('cycles from last function back to first', () => {
    const order = Object.values(StatisticsFunction);
    const last = order[order.length - 1];
    const result = cycleStatisticFunction(last);
    expect(result).toBe(order[0]);
  });

  it('cycles Value -> None', () => {
    expect(cycleStatisticFunction(StatisticsFunction.Value)).toBe(StatisticsFunction.None);
  });
});
