import React from 'react';

export type SimpleinputProps = {
  placeholder?: string;
  onChange?: any;
};

export function Simpleinput({ placeholder = '', onChange }: SimpleinputProps) {
  return <input placeholder={placeholder} onChange={onChange} />;
}
