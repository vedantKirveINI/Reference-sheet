import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ButtonEditor } from '../button-editor';
import type { IButtonOptions } from '@/types/cell';

describe('ButtonEditor', () => {
  const defaultOptions: IButtonOptions = {
    label: 'Submit',
    style: 'primary',
  };

  it('renders with label from options', () => {
    render(<ButtonEditor options={defaultOptions} onClick={vi.fn()} />);
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  it('renders default label "Click" when no label provided', () => {
    render(<ButtonEditor options={{}} onClick={vi.fn()} />);
    expect(screen.getByText('Click')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ButtonEditor options={defaultOptions} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn();
    render(<ButtonEditor options={defaultOptions} onClick={onClick} disabled />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('renders with different style classes', () => {
    const styles: Array<IButtonOptions['style']> = ['primary', 'default', 'danger', 'success', 'warning'];
    styles.forEach(style => {
      const { unmount } = render(
        <ButtonEditor options={{ ...defaultOptions, style }} onClick={vi.fn()} />
      );
      expect(screen.getByRole('button')).toBeInTheDocument();
      unmount();
    });
  });

  it('shows click count when maxCount is set', () => {
    render(
      <ButtonEditor options={{ ...defaultOptions, maxCount: 5 }} onClick={vi.fn()} clickCount={2} />
    );
    expect(screen.getByText('(2/5)')).toBeInTheDocument();
  });

  it('disables when click limit is reached', () => {
    const onClick = vi.fn();
    render(
      <ButtonEditor options={{ ...defaultOptions, maxCount: 3 }} onClick={onClick} clickCount={3} />
    );
    expect(screen.getByRole('button')).toBeDisabled();
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('shows confirm dialog when confirm option is set', () => {
    const onClick = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(
      <ButtonEditor
        options={{ ...defaultOptions, confirm: { title: 'Are you sure?' } }}
        onClick={onClick}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(confirmSpy).toHaveBeenCalled();
    expect(onClick).toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('does not call onClick when confirm is cancelled', () => {
    const onClick = vi.fn();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(
      <ButtonEditor
        options={{ ...defaultOptions, confirm: { title: 'Are you sure?', description: 'This action cannot be undone' } }}
        onClick={onClick}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(confirmSpy).toHaveBeenCalled();
    expect(onClick).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
