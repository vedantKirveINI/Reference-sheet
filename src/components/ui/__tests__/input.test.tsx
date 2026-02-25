import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../input';

describe('Input', () => {
  it('renders with default type text', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with type number', () => {
    render(<Input type="number" data-testid="num" />);
    expect(screen.getByTestId('num')).toHaveAttribute('type', 'number');
  });

  it('renders with type email', () => {
    render(<Input type="email" data-testid="email" />);
    expect(screen.getByTestId('email')).toHaveAttribute('type', 'email');
  });

  it('renders with type password', () => {
    render(<Input type="password" data-testid="pw" />);
    expect(screen.getByTestId('pw')).toHaveAttribute('type', 'password');
  });

  it('handles value and onChange', () => {
    const onChange = vi.fn();
    render(<Input value="hello" onChange={onChange} data-testid="inp" />);
    const input = screen.getByTestId('inp');
    expect(input).toHaveValue('hello');
    fireEvent.change(input, { target: { value: 'world' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('handles disabled state', () => {
    render(<Input disabled data-testid="inp" />);
    expect(screen.getByTestId('inp')).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" data-testid="inp" />);
    expect(screen.getByTestId('inp').className).toContain('custom-input');
  });

  it('renders placeholder', () => {
    render(<Input placeholder="Type here..." />);
    expect(screen.getByPlaceholderText('Type here...')).toBeInTheDocument();
  });
});
