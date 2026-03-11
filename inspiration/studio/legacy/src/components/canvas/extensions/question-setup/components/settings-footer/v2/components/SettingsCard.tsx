/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import { useState, ReactNode } from "react";
import { ODSLabel, ODSIcon } from "@src/module/ods";
import { SettingsCardType } from "../config";

interface SettingsCardProps {
  type: SettingsCardType;
  title: string;
  children: ReactNode;
  defaultExpanded?: boolean;
  summaryBadge?: string;
  disabled?: boolean;
  disabledMessage?: string;
  testId?: string;
}

const styles = {
  container: css`
    border-radius: 8px;
    margin-bottom: 8px;
    overflow: hidden;
    background: #fff;
  `,
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: #f5f5f5;
    }
  `,
  headerDisabled: css`
    cursor: default;
    opacity: 0.6;
    
    &:hover {
      background-color: transparent;
    }
  `,
  headerLeft: css`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  headerRight: css`
    display: flex;
    align-items: center;
    gap: 12px;
  `,
  title: css`
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 1.25px;
    text-transform: uppercase;
    color: #212121;
  `,
  badge: css`
    font-size: 12px;
    color: #757575;
    background: #f0f0f0;
    padding: 2px 8px;
    border-radius: 4px;
    white-space: nowrap;
  `,
  badgeActive: css`
    color: #1976d2;
    background: #e3f2fd;
  `,
  expandIcon: (expanded: boolean) => css`
    transition: transform 0.2s ease;
    transform: rotate(${expanded ? 90 : 0}deg);
  `,
  content: css`
    padding: 0 16px 16px 16px;
    animation: slideDown 0.2s ease-out;
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  disabledMessage: css`
    padding: 12px 16px;
    color: #757575;
    font-size: 13px;
    font-style: italic;
    background: #fafafa;
    border-radius: 4px;
    margin: 8px 16px 16px 16px;
  `,
  separator: css`
    height: 1px;
    background: #e0e0e0;
    margin: 0 16px;
  `,
};

export const SettingsCard = ({
  type,
  title,
  children,
  defaultExpanded = false,
  summaryBadge,
  disabled = false,
  disabledMessage,
  testId,
}: SettingsCardProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleToggle = () => {
    if (!disabled) {
      setExpanded(!expanded);
    }
  };

  const hasBadgeContent = summaryBadge && summaryBadge.length > 0;
  const showBadge = !expanded && hasBadgeContent;

  return (
    <div css={styles.container} data-testid={testId || `settings-card-${type}`}>
      <div
        css={[styles.header, disabled && styles.headerDisabled]}
        onClick={handleToggle}
        role="button"
        aria-expanded={expanded}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
      >
        <div css={styles.headerLeft}>
          <ODSIcon
            outeIconName="OUTEChevronRightIcon"
            outeIconProps={{
              sx: {
                color: disabled ? "#bdbdbd" : "#607D8B",
                width: "1.25em",
                height: "1.25em",
                transition: "transform 0.2s ease",
                transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              },
            }}
          />
          <span css={styles.title}>{title}</span>
        </div>
        <div css={styles.headerRight}>
          {showBadge && (
            <span css={[styles.badge, summaryBadge !== "No rules set" && summaryBadge !== "Default" && styles.badgeActive]}>
              {summaryBadge}
            </span>
          )}
        </div>
      </div>

      {expanded && !disabled && (
        <>
          <div css={styles.separator} />
          <div css={styles.content}>{children}</div>
        </>
      )}

      {disabled && disabledMessage && (
        <div css={styles.disabledMessage}>{disabledMessage}</div>
      )}
    </div>
  );
};

export default SettingsCard;
