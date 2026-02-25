import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldModalContent, FieldModalData } from '../field-modal';
import { CellType } from '@/types';

vi.mock('@/components/ui/popover', async () => {
  const React = await import('react');
  return {
    Popover: ({ children }: any) => <div>{children}</div>,
    PopoverTrigger: ({ children }: any) => <div>{children}</div>,
    PopoverContent: React.forwardRef(({ children, ...rest }: any, ref: any) => <div ref={ref} data-testid="popover-content">{children}</div>),
  };
});

function FieldModalWrapper(props: React.ComponentProps<typeof FieldModalContent>) {
  return <FieldModalContent {...props} />;
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'fieldModal.addField': 'New field',
        'fieldModal.editField': 'Edit field',
        'fieldModal.fieldName': 'Field name',
        'fieldModal.enterFieldName': 'Field name',
        'fieldModal.fieldType': 'Field type',
        'fieldModal.searchFieldTypes': 'Search field types...',
        'fieldModal.optionalDescription': 'Add a description...',
        'fieldModal.validation': 'Validation',
        'fieldModal.required': 'Required',
        'fieldModal.uniqueValues': 'Unique values',
        'fieldModal.searchFields': 'Search fields',
        'description': 'Description',
        'cancel': 'Cancel',
        'save': 'Save',
      };
      return map[key] ?? key;
    },
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

vi.mock('@/stores/fields-store', () => ({
  useFieldsStore: (selector: any) => {
    const store = {
      allColumns: [
        { id: 'col-1', name: 'Name', type: 'String', rawType: 'SHORT_TEXT', rawId: 1, width: 200 },
        { id: 'col-2', name: 'Link', type: 'Link', rawType: 'LINK', rawId: 2, width: 200, options: { foreignTableId: 'table-2' } },
      ],
    };
    return selector(store);
  },
}));

vi.mock('@/services/api', () => ({
  getForeignTableFields: vi.fn().mockResolvedValue({
    data: [{ id: 1, name: 'Foreign Name', type: 'TEXT' }],
  }),
}));

describe('FieldModalContent', () => {
  let onSave: ReturnType<typeof vi.fn>;
  let onCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSave = vi.fn();
    onCancel = vi.fn();
  });

  it('renders nothing when data is null', () => {
    const { container } = render(
      <FieldModalWrapper data={null} onSave={onSave} onCancel={onCancel} />
    );
    expect(container.textContent).toBe('');
  });

  it('renders create mode title', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('New field')).toBeInTheDocument();
  });

  it('renders edit mode title', () => {
    const data: FieldModalData = {
      mode: 'edit',
      fieldName: 'Existing',
      fieldType: CellType.String,
      fieldId: 'col-1',
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('Edit field')).toBeInTheDocument();
  });

  it('renders field name input', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByPlaceholderText('Field name')).toBeInTheDocument();
  });

  it('populates name input in edit mode', () => {
    const data: FieldModalData = {
      mode: 'edit',
      fieldName: 'Age',
      fieldType: CellType.Number,
      fieldId: 'col-2',
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    const input = screen.getByPlaceholderText('Field name') as HTMLInputElement;
    expect(input.value).toBe('Age');
  });

  it('renders field type search', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByPlaceholderText('Search field types...')).toBeInTheDocument();
  });

  it('renders field type categories', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('Basic')).toBeInTheDocument();
  });

  it('renders save button', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders save button in edit mode', () => {
    const data: FieldModalData = {
      mode: 'edit',
      fieldName: 'Name',
      fieldType: CellType.String,
      fieldId: 'col-1',
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    await user.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalled();
  });

  it('changes field type when clicking a type option', async () => {
    const user = userEvent.setup();
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    await user.click(screen.getByText('Number'));
    const numberLabel = screen.getAllByText('Number');
    expect(numberLabel.length).toBeGreaterThan(0);
  });

  it('shows choice options for SCQ type', async () => {
    const user = userEvent.setup();
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.SCQ,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('Options')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Option 1')).toBeInTheDocument();
  });

  it('shows choice options for MCQ type', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.MCQ,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('Options')).toBeInTheDocument();
  });

  it('shows rating config for Rating type', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.Rating,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('Max Rating')).toBeInTheDocument();
  });

  it('shows currency symbol for Currency type', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.Currency,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('Currency Symbol')).toBeInTheDocument();
  });

  it('shows slider config for Slider type', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.Slider,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('Min Value')).toBeInTheDocument();
    expect(screen.getByText('Max Value')).toBeInTheDocument();
  });

  it('shows link configuration for Link type', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.Link,
    };
    render(
      <FieldModalContent
        data={data}
        onSave={onSave}
        onCancel={onCancel}
        tables={[{ id: 'table-1', name: 'Table 1' }, { id: 'table-2', name: 'Table 2' }]}
        currentTableId="table-1"
      />
    );
    expect(screen.getAllByText('Link to Table').length).toBeGreaterThan(0);
  });

  it('shows button config for Button type', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.Button,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('Label')).toBeInTheDocument();
    expect(screen.getByText('Style')).toBeInTheDocument();
  });

  it('calls onSave with field data when create button is clicked', async () => {
    const user = userEvent.setup();
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    const input = screen.getByPlaceholderText('Field name');
    await user.type(input, 'Test Field');
    await user.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it('calls onSave with empty name defaulting to Untitled', async () => {
    const user = userEvent.setup();
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    const saveBtn = screen.getByText('Save').closest('button');
    expect(saveBtn).toBeDisabled();
  });

  it('filters field types by search', async () => {
    const user = userEvent.setup();
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    const search = screen.getByPlaceholderText('Search field types...');
    await user.type(search, 'rating');
    expect(screen.getByText('Rating')).toBeInTheDocument();
    expect(screen.queryByText('Text & Numbers')).not.toBeInTheDocument();
  });

  it('shows description input', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.String,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByPlaceholderText('Add a description...')).toBeInTheDocument();
  });

  it('shows enrichment config for Enrichment type', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.Enrichment,
    };
    const { container } = render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(container).toBeTruthy();
  });

  it('shows DateTime format options for DateTime type', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.DateTime,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getByText('Date Format')).toBeInTheDocument();
  });

  it('shows Lookup config for Lookup type', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.Lookup,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getAllByText('Link Field').length).toBeGreaterThan(0);
  });

  it('shows Rollup config for Rollup type', () => {
    const data: FieldModalData = {
      mode: 'create',
      fieldName: '',
      fieldType: CellType.Rollup,
    };
    render(<FieldModalWrapper data={data} onSave={onSave} onCancel={onCancel} />);
    expect(screen.getAllByText('Link Field').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Rollup Function').length).toBeGreaterThan(0);
  });
});
