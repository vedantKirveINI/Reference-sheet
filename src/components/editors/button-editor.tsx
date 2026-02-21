import React from 'react';
import { IButtonOptions } from '@/types/cell';

interface ButtonEditorProps {
  options: IButtonOptions;
  onClick: () => void;
  disabled?: boolean;
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
}) => {
  const label = options.label || 'Click';
  const style = options.style || 'primary';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${STYLE_CLASSES[style] || STYLE_CLASSES.primary} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {label}
    </button>
  );
};
