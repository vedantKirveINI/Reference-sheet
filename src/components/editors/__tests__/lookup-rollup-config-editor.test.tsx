import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LookupRollupConfigEditor } from '../lookup-rollup-config-editor';

describe('LookupRollupConfigEditor', () => {
  const linkFields = [
    { id: 1, name: 'Link to Tasks', foreignTableId: 10 },
    { id: 2, name: 'Link to People', foreignTableId: 20 },
  ];
  const foreignFields = [
    { id: 100, name: 'Name', type: 'SHORT_TEXT' },
    { id: 101, name: 'Count', type: 'NUMBER' },
    { id: 102, name: 'Active', type: 'CHECKBOX' },
  ];

  const defaultValue = {
    linkFieldId: 1,
    lookupFieldId: 100,
    foreignTableId: 10,
  };

  describe('Lookup mode', () => {
    it('renders link field selector', () => {
      render(
        <LookupRollupConfigEditor
          type="Lookup"
          value={defaultValue}
          onChange={vi.fn()}
          linkFields={linkFields}
          foreignFields={foreignFields}
        />
      );
      expect(screen.getByText('Link Field')).toBeInTheDocument();
    });

    it('renders lookup field selector', () => {
      render(
        <LookupRollupConfigEditor
          type="Lookup"
          value={defaultValue}
          onChange={vi.fn()}
          linkFields={linkFields}
          foreignFields={foreignFields}
        />
      );
      expect(screen.getByText('Lookup Field')).toBeInTheDocument();
    });

    it('does not show rollup function for Lookup type', () => {
      render(
        <LookupRollupConfigEditor
          type="Lookup"
          value={defaultValue}
          onChange={vi.fn()}
          linkFields={linkFields}
          foreignFields={foreignFields}
        />
      );
      expect(screen.queryByText('Rollup Function')).toBeNull();
    });

    it('calls onChange when link field changes', () => {
      const onChange = vi.fn();
      render(
        <LookupRollupConfigEditor
          type="Lookup"
          value={defaultValue}
          onChange={onChange}
          linkFields={linkFields}
          foreignFields={foreignFields}
        />
      );
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: '2' } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ linkFieldId: 2, foreignTableId: 20 })
      );
    });

    it('calls onLinkFieldChange callback', () => {
      const onLinkFieldChange = vi.fn();
      render(
        <LookupRollupConfigEditor
          type="Lookup"
          value={defaultValue}
          onChange={vi.fn()}
          linkFields={linkFields}
          foreignFields={foreignFields}
          onLinkFieldChange={onLinkFieldChange}
        />
      );
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: '2' } });
      expect(onLinkFieldChange).toHaveBeenCalledWith(2);
    });

    it('calls onChange when lookup field changes', () => {
      const onChange = vi.fn();
      render(
        <LookupRollupConfigEditor
          type="Lookup"
          value={defaultValue}
          onChange={onChange}
          linkFields={linkFields}
          foreignFields={foreignFields}
        />
      );
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[1], { target: { value: '101' } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ lookupFieldId: 101 })
      );
    });

    it('disables lookup field when no link field selected', () => {
      render(
        <LookupRollupConfigEditor
          type="Lookup"
          value={{ linkFieldId: 0, lookupFieldId: 0, foreignTableId: 0 }}
          onChange={vi.fn()}
          linkFields={linkFields}
          foreignFields={foreignFields}
        />
      );
      const selects = screen.getAllByRole('combobox');
      expect(selects[1]).toBeDisabled();
    });
  });

  describe('Rollup mode', () => {
    const rollupValue = {
      linkFieldId: 1,
      lookupFieldId: 101,
      foreignTableId: 10,
      expression: 'sum',
    };

    it('shows rollup function selector', () => {
      render(
        <LookupRollupConfigEditor
          type="Rollup"
          value={rollupValue}
          onChange={vi.fn()}
          linkFields={linkFields}
          foreignFields={foreignFields}
        />
      );
      expect(screen.getByText('Rollup Function')).toBeInTheDocument();
    });

    it('calls onChange when rollup expression changes', () => {
      const onChange = vi.fn();
      render(
        <LookupRollupConfigEditor
          type="Rollup"
          value={rollupValue}
          onChange={onChange}
          linkFields={linkFields}
          foreignFields={foreignFields}
        />
      );
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[2], { target: { value: 'average' } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ expression: 'average' })
      );
    });

    it('shows all rollup functions for numeric fields', () => {
      render(
        <LookupRollupConfigEditor
          type="Rollup"
          value={rollupValue}
          onChange={vi.fn()}
          linkFields={linkFields}
          foreignFields={foreignFields}
        />
      );
      const selects = screen.getAllByRole('combobox');
      const options = selects[2].querySelectorAll('option');
      expect(options.length).toBeGreaterThan(5);
    });
  });
});
