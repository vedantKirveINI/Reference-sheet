import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxEditorProps {
  value: boolean | null;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export const CheckboxEditor: React.FC<CheckboxEditorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const checked = value === true;

  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        checked
          ? 'bg-brand-500 border-brand-500 text-white'
          : 'border-gray-300 dark:border-zinc-600 hover:border-brand-400'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {checked && <Check className="w-3.5 h-3.5" />}
    </button>
  );
};
