import React from 'react';
import { cn } from '@/lib/utils';

const ModeToggleButton = ({
  mode = 'dropdown',
  onModeChange = () => {},
  disabled = false,
  className = '',
}) => {
  const isFormulaMode = mode === 'formula';

  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!disabled) {
      const newMode = isFormulaMode ? 'dropdown' : 'formula';
      onModeChange(newMode);
    }
  };

  const tooltipText = isFormulaMode 
    ? 'Switch to simple selection' 
    : 'Switch to formula mode';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={tooltipText}
      className={cn(
        'inline-flex items-center justify-center',
        'h-5 px-1.5 rounded',
        'text-[10px] font-semibold tracking-wide',
        'transition-all duration-150',
        'focus:outline-none focus:ring-1 focus:ring-offset-1',
        'font-["IBM_Plex_Mono",monospace]',
        isFormulaMode
          ? 'bg-[#1C3693] text-white hover:bg-[#152a75] focus:ring-[#1C3693]/50'
          : 'bg-[#E8E8E8] text-[#6B7280] hover:bg-[#D1D5DB] hover:text-[#374151] focus:ring-[#9CA3AF]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      fx
    </button>
  );
};

export default ModeToggleButton;
export { ModeToggleButton };
