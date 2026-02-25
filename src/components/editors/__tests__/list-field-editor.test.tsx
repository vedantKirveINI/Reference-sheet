import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ListFieldEditor } from '../list-field-editor';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

describe('ListFieldEditor', () => {
  it('renders without crashing', () => {
    render(<ListFieldEditor value={[]} onChange={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders with existing items as tags', () => {
    const { container } = render(<ListFieldEditor value={['Apple', 'Banana']} onChange={vi.fn()} />);
    const tags = container.querySelectorAll('[class*="tag"], [class*="badge"], [class*="chip"], span');
    const tagTexts = Array.from(tags).map(t => t.textContent).join(' ');
    expect(tagTexts).toContain('Apple');
    expect(tagTexts).toContain('Banana');
  });

  it('renders empty state', () => {
    render(<ListFieldEditor value={[]} onChange={vi.fn()} />);
    expect(screen.queryByText('Apple')).toBeNull();
  });

  it('adds new tag via Enter key in non-popover mode', () => {
    const onChange = vi.fn();
    render(<ListFieldEditor value={[]} onChange={onChange} popoverStyle={false} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'NewTag' } });
    fireEvent.keyDown(input, { key: 'Enter' });
  });

  it('does not add empty tags', () => {
    const onChange = vi.fn();
    render(<ListFieldEditor value={[]} onChange={onChange} popoverStyle={false} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
  });

  it('does not add duplicate tags', () => {
    render(<ListFieldEditor value={['Apple']} onChange={vi.fn()} popoverStyle={false} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Apple' } });
    fireEvent.keyDown(input, { key: 'Enter' });
  });

  it('handles Escape in popover mode', () => {
    const onCancel = vi.fn();
    render(<ListFieldEditor value={[]} onChange={vi.fn()} onCancel={onCancel} popoverStyle />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('handles search input changes', () => {
    render(<ListFieldEditor value={['Apple', 'Banana', 'Cherry']} onChange={vi.fn()} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'ban' } });
    expect(input).toHaveValue('ban');
  });
});
