import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Separator } from '../separator';

describe('Separator', () => {
  it('renders horizontal separator by default', () => {
    const { container } = render(<Separator />);
    const sep = container.firstChild as HTMLElement;
    expect(sep.className).toContain('w-full');
    expect(sep.className).toContain('h-[1px]');
  });

  it('renders vertical separator', () => {
    const { container } = render(<Separator orientation="vertical" />);
    const sep = container.firstChild as HTMLElement;
    expect(sep.className).toContain('h-full');
    expect(sep.className).toContain('w-[1px]');
  });

  it('applies custom className', () => {
    const { container } = render(<Separator className="my-sep" />);
    expect((container.firstChild as HTMLElement).className).toContain('my-sep');
  });
});
