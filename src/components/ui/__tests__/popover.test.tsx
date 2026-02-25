import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Popover, PopoverTrigger, PopoverContent } from '../popover';

describe('Popover', () => {
  it('renders trigger', () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('hides content when closed', () => {
    render(
      <Popover open={false}>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Hidden Content</PopoverContent>
      </Popover>
    );
    expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument();
  });

  it('renders trigger as button by default', () => {
    render(
      <Popover>
        <PopoverTrigger>Toggle</PopoverTrigger>
        <PopoverContent>Shown</PopoverContent>
      </Popover>
    );
    const trigger = screen.getByText('Toggle');
    expect(trigger).toBeInTheDocument();
    expect(trigger.tagName).toBe('BUTTON');
  });

  it('exports PopoverContent and PopoverTrigger', () => {
    expect(PopoverContent).toBeDefined();
    expect(PopoverTrigger).toBeDefined();
    expect(Popover).toBeDefined();
  });
});
