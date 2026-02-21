import React, { useState } from 'react';
import { ILookupOptions, IRollupOptions } from '@/types/cell';

interface LookupRollupConfigEditorProps {
  type: 'Lookup' | 'Rollup';
  value: ILookupOptions | IRollupOptions;
  onChange: (value: ILookupOptions | IRollupOptions) => void;
  linkFields?: Array<{ id: number; name: string; foreignTableId: number }>;
  foreignFields?: Array<{ id: number; name: string; type: string }>;
  onLinkFieldChange?: (linkFieldId: number) => void;
}

const ROLLUP_FUNCTIONS = [
  { value: 'countall', label: 'Count All', desc: 'Count of all linked records' },
  { value: 'counta', label: 'Count Non-Empty', desc: 'Count of non-empty values' },
  { value: 'count', label: 'Count Numbers', desc: 'Count of numeric values' },
  { value: 'sum', label: 'Sum', desc: 'Sum of numeric values' },
  { value: 'average', label: 'Average', desc: 'Average of numeric values' },
  { value: 'max', label: 'Max', desc: 'Maximum value' },
  { value: 'min', label: 'Min', desc: 'Minimum value' },
  { value: 'and', label: 'AND', desc: 'Logical AND of boolean values' },
  { value: 'or', label: 'OR', desc: 'Logical OR of boolean values' },
  { value: 'xor', label: 'XOR', desc: 'Logical XOR of boolean values' },
  { value: 'array_join', label: 'Join', desc: 'Join values with comma' },
  { value: 'array_unique', label: 'Unique', desc: 'Unique values' },
  { value: 'array_compact', label: 'Compact', desc: 'Remove empty values' },
  { value: 'concatenate', label: 'Concatenate', desc: 'Concatenate all values' },
];

export const LookupRollupConfigEditor: React.FC<LookupRollupConfigEditorProps> = ({
  type,
  value,
  onChange,
  linkFields = [],
  foreignFields = [],
  onLinkFieldChange,
}) => {
  const [selectedLinkFieldId, setSelectedLinkFieldId] = useState(value.linkFieldId);

  const handleLinkFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    setSelectedLinkFieldId(id);
    const linkField = linkFields.find(f => f.id === id);
    onChange({
      ...value,
      linkFieldId: id,
      foreignTableId: linkField?.foreignTableId || value.foreignTableId,
    });
    onLinkFieldChange?.(id);
  };

  const handleLookupFieldChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...value,
      lookupFieldId: Number(e.target.value),
    });
  };

  const handleExpressionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({
      ...value,
      expression: e.target.value,
    } as IRollupOptions);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
          Link Field
        </label>
        <select
          value={selectedLinkFieldId || ''}
          onChange={handleLinkFieldChange}
          className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-900 dark:border-zinc-700"
        >
          <option value="">Select a link field...</option>
          {linkFields.map(field => (
            <option key={field.id} value={field.id}>{field.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
          Lookup Field
        </label>
        <select
          value={value.lookupFieldId || ''}
          onChange={handleLookupFieldChange}
          className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-900 dark:border-zinc-700"
          disabled={!selectedLinkFieldId}
        >
          <option value="">Select a field to look up...</option>
          {foreignFields.map(field => (
            <option key={field.id} value={field.id}>{field.name} ({field.type})</option>
          ))}
        </select>
      </div>

      {type === 'Rollup' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
            Rollup Function
          </label>
          <select
            value={(value as IRollupOptions).expression || ''}
            onChange={handleExpressionChange}
            className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-900 dark:border-zinc-700"
          >
            <option value="">Select a function...</option>
            {ROLLUP_FUNCTIONS.map(fn => (
              <option key={fn.value} value={fn.value}>{fn.label} - {fn.desc}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};
