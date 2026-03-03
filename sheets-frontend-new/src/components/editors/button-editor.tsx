import React from 'react';
import { IButtonOptions } from '@/types/cell';

interface ButtonEditorProps {
  options: IButtonOptions;
  onClick: () => void;
  disabled?: boolean;
  clickCount?: number;
}

const STYLE_CLASSES: Record<string, string> = {
  primary: 'bg-brand-500 hover:bg-brand-600 text-white',
  default: 'bg-gray-500 hover:bg-gray-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white',
};

export const ButtonEditor: React.FC<ButtonEditorProps> = ({
  options,
  onClick,
  disabled = false,
  clickCount = 0,
}) => {
  const label = options.label || 'Click';
  const style = options.style || 'primary';
  const isLimitReached = options.maxCount && options.maxCount > 0 && clickCount >= options.maxCount;

  const handleClick = () => {
    if (isLimitReached) return;
    if (options.confirm?.title) {
      const confirmed = window.confirm(
        `${options.confirm.title}\n\n${options.confirm.description || ''}`
      );
      if (!confirmed) return;
    }
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || !!isLimitReached}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${STYLE_CLASSES[style] || STYLE_CLASSES.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {label}
      {options.maxCount && options.maxCount > 0 && (
        <span className="text-xs opacity-60 ml-1">
          ({clickCount}/{options.maxCount})
        </span>
      )}
    </button>
  );
};
