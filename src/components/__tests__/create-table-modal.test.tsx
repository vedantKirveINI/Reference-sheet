import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateTableModal } from '../create-table-modal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

describe('CreateTableModal', () => {
  let onCreateFromTemplate: ReturnType<typeof vi.fn>;
  let onCreateBlank: ReturnType<typeof vi.fn>;
  let onOpenChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onCreateFromTemplate = vi.fn().mockResolvedValue(undefined);
    onCreateBlank = vi.fn().mockResolvedValue(undefined);
    onOpenChange = vi.fn();
  });

  it('renders when open', () => {
    render(
      <CreateTableModal
        open={true}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    expect(screen.getByText('Create a new table')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <CreateTableModal
        open={false}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    expect(screen.queryByText('Create a new table')).not.toBeInTheDocument();
  });

  it('renders name input', () => {
    render(
      <CreateTableModal
        open={true}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    expect(screen.getByPlaceholderText('Enter table name...')).toBeInTheDocument();
  });

  it('renders Create button', () => {
    render(
      <CreateTableModal
        open={true}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('renders Templates section', () => {
    render(
      <CreateTableModal
        open={true}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    expect(screen.getByText('Templates')).toBeInTheDocument();
  });

  it('renders all 6 templates', () => {
    render(
      <CreateTableModal
        open={true}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    expect(screen.getByText('CRM Contacts')).toBeInTheDocument();
    expect(screen.getByText('Sales Pipeline')).toBeInTheDocument();
  });

  it('calls onCreateBlank with default name when Create clicked with empty input', async () => {
    const user = userEvent.setup();
    render(
      <CreateTableModal
        open={true}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    await user.click(screen.getByText('Create'));
    await waitFor(() => {
      expect(onCreateBlank).toHaveBeenCalledWith('Untitled Table');
    });
  });

  it('calls onCreateBlank with custom name', async () => {
    const user = userEvent.setup();
    render(
      <CreateTableModal
        open={true}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    const input = screen.getByPlaceholderText('Enter table name...');
    await user.type(input, 'My Table');
    await user.click(screen.getByText('Create'));
    await waitFor(() => {
      expect(onCreateBlank).toHaveBeenCalledWith('My Table');
    });
  });

  it('calls onCreateFromTemplate when template is clicked', async () => {
    const user = userEvent.setup();
    render(
      <CreateTableModal
        open={true}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    await user.click(screen.getByText('CRM Contacts'));
    await waitFor(() => {
      expect(onCreateFromTemplate).toHaveBeenCalledTimes(1);
      expect(onCreateFromTemplate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'crm-contacts', name: 'CRM Contacts' }),
        undefined,
      );
    });
  });

  it('passes custom name to template creation', async () => {
    const user = userEvent.setup();
    render(
      <CreateTableModal
        open={true}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    const input = screen.getByPlaceholderText('Enter table name...');
    await user.type(input, 'Custom');
    await user.click(screen.getByText('CRM Contacts'));
    await waitFor(() => {
      expect(onCreateFromTemplate).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'crm-contacts' }),
        'Custom',
      );
    });
  });

  it('calls onCreateBlank on Enter key press in input', async () => {
    const user = userEvent.setup();
    render(
      <CreateTableModal
        open={true}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    const input = screen.getByPlaceholderText('Enter table name...');
    await user.type(input, 'Test{Enter}');
    await waitFor(() => {
      expect(onCreateBlank).toHaveBeenCalledWith('Test');
    });
  });

  it('closes modal after successful creation', async () => {
    const user = userEvent.setup();
    render(
      <CreateTableModal
        open={true}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    await user.click(screen.getByText('Create'));
    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('shows description text', () => {
    render(
      <CreateTableModal
        open={true}
        onOpenChange={onOpenChange}
        onCreateFromTemplate={onCreateFromTemplate}
        onCreateBlank={onCreateBlank}
      />
    );
    expect(screen.getByText(/Start from a template or create a blank table/)).toBeInTheDocument();
  });
});
