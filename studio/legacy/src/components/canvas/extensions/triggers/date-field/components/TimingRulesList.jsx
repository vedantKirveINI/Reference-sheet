import React from 'react';
import TimingRuleCard from './TimingRuleCard';
import ODSButton from 'oute-ds-button';
import ODSIcon from 'oute-ds-icon';
import styles from './TimingRulesList.module.css';

const TimingRulesList = ({
  rules = [],
  onAddRule,
  onRemoveRule,
  onUpdateRule,
}) => {
  const canRemove = rules.length > 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <p className={styles.headerTitle}>
            Timing Rules<span className={styles.required}>*</span>
          </p>
          <p className={styles.headerDescription}>
            Define when the workflow will run
          </p>
        </div>
        <ODSButton
          label="ADD RULE"
          variant="black"
          onClick={onAddRule}
          startIcon={
            <ODSIcon
              outeIconName="OUTEAddIcon"
              outeIconProps={{
                sx: {
                  color: "#fff",
                  width: "1.5rem",
                  height: "1.5rem",
                },
              }}
            />
          }
          sx={{
            height: "2.75rem",
            minWidth: "7.5rem",
            gap: "0.75rem",
            padding: "0.6875rem 1.5rem",
          }}
        />
      </div>

      <div className={styles.rulesList}>
        {rules.map((rule, index) => (
          <TimingRuleCard
            key={rule.id}
            rule={rule}
            index={index}
            canRemove={canRemove}
            onRemove={() => onRemoveRule(rule.id)}
            onUpdate={(updates) => onUpdateRule(rule.id, updates)}
          />
        ))}
      </div>
    </div>
  );
};

export default TimingRulesList;
