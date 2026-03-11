import React, { useMemo } from 'react';
import { useScheduleSummary } from '../hooks/useScheduleSummary';
import { calculateNextRuns, formatRunDate } from '../utils/schedule-calculator';
import classes from './ConfigComponents.module.css';

const ScheduleSummary = ({ config }) => {
  const summary = useScheduleSummary(config);

  const nextRuns = useMemo(() => {
    try {
      return calculateNextRuns(config, 5);
    } catch (e) {
      console.warn('Error calculating next runs:', e);
      return [];
    }
  }, [config]);

  const formattedRuns = useMemo(() => {
    return nextRuns.map(run => formatRunDate(run, config.timezone));
  }, [nextRuns, config.timezone]);

  return (
    <div className={classes.summaryContainer}>
      <div className={classes.summaryHeader}>
        <div className={classes.summaryIcon}>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className={classes.summaryContent}>
          <label className={classes.summaryLabel}>Schedule Summary</label>
          <p className={classes.summaryText} data-testid="schedule-summary-text">
            {summary}
          </p>
        </div>
      </div>

      {formattedRuns.length > 0 && (
        <div className={classes.nextRunsContainer}>
          <label className={classes.nextRunsLabel}>
            Next scheduled runs
          </label>
          <ul className={classes.nextRunsList}>
            {formattedRuns.map((run, index) => (
              <li key={index} className={classes.nextRunItem}>
                <span className={classes.nextRunBullet}>•</span>
                <span className={classes.nextRunText}>{run.full}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {formattedRuns.length === 0 && (
        <div className={classes.noRunsMessage}>
          <p>No upcoming runs scheduled. Please complete the configuration above.</p>
        </div>
      )}
    </div>
  );
};

export default ScheduleSummary;
