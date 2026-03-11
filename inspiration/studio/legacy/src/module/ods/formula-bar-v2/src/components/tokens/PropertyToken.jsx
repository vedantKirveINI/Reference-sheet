import React from "react";
import classes from './PropertyToken.module.css';

const TYPE_ICONS = {
  text: '#',
  number: '#',
  checkbox: '☑',
  select: '▼',
  multiselect: '▤',
  date: '📅',
  person: '👤',
  relation: '↗',
  formula: 'Σ',
  rollup: '⊕',
  url: '🔗',
  email: '✉',
  phone: '📞',
  file: '📎',
  default: '◉',
};

const TYPE_COLORS = {
  text: { bg: '#f1f1f0', border: '#e0e0de', icon: '#9b9a97' },
  number: { bg: '#fff8e1', border: '#ffe082', icon: '#f9a825' },
  checkbox: { bg: '#e8f5e9', border: '#a5d6a7', icon: '#43a047' },
  select: { bg: '#e3f2fd', border: '#90caf9', icon: '#1976d2' },
  multiselect: { bg: '#f3e5f5', border: '#ce93d8', icon: '#8e24aa' },
  date: { bg: '#fce4ec', border: '#f48fb1', icon: '#d81b60' },
  person: { bg: '#e8eaf6', border: '#9fa8da', icon: '#3f51b5' },
  relation: { bg: '#e0f7fa', border: '#80deea', icon: '#00acc1' },
  formula: { bg: '#fff3e0', border: '#ffcc80', icon: '#ef6c00' },
  rollup: { bg: '#f1f8e9', border: '#aed581', icon: '#689f38' },
  default: { bg: '#f5f5f5', border: '#e0e0e0', icon: '#757575' },
};

const PropertyToken = ({ 
  name, 
  type = 'text', 
  hasError = false,
  onClick = () => {},
}) => {
  const icon = TYPE_ICONS[type] || TYPE_ICONS.default;
  const colors = TYPE_COLORS[type] || TYPE_COLORS.default;

  return (
    <span 
      className={`${classes.token} ${hasError ? classes.error : ''}`}
      style={{
        backgroundColor: colors.bg,
        borderColor: hasError ? '#eb5757' : colors.border,
      }}
      onClick={onClick}
    >
      <span className={classes.icon} style={{ color: colors.icon }}>
        {icon}
      </span>
      <span className={classes.name}>{name}</span>
    </span>
  );
};

export default PropertyToken;
