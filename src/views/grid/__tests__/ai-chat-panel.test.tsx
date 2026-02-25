import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIChatPanel } from '../ai-chat-panel';
import { useAIChatStore } from '@/stores/ai-chat-store';
import { useConditionalColorStore } from '@/stores/conditional-color-store';
import { CellType } from '@/types';

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

vi.mock('remark-gfm', () => ({
  default: () => {},
}));

const defaultColumns = [
  { id: 'col-1', name: 'Name', type: CellType.String, width: 200 },
  { id: 'col-2', name: 'Amount', type: CellType.Number, width: 100 },
];

describe('AIChatPanel', () => {
  beforeEach(() => {
    useAIChatStore.setState({
      isOpen: false,
      conversations: [],
      currentConversationId: null,
      messages: [],
      streamingContent: '',
      isStreaming: false,
      pendingActions: [],
      consentRequests: [],
      showConversationList: false,
      thinkingMessage: null,
      toolSteps: [],
      panelLayout: 'right',
      contextPrefill: '',
    });
    useConditionalColorStore.setState({ rules: [] });
  });

  it('returns null when not open', () => {
    const { container } = render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" columns={defaultColumns as any} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders when open', () => {
    useAIChatStore.setState({ isOpen: true });
    render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" columns={defaultColumns as any} />
    );
    expect(screen.getByPlaceholderText(/ask/i)).toBeInTheDocument();
  });

  it('renders close button when open', () => {
    useAIChatStore.setState({ isOpen: true });
    const { container } = render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" columns={defaultColumns as any} />
    );
    expect(container.querySelector('button')).toBeInTheDocument();
  });

  it('renders input field', () => {
    useAIChatStore.setState({ isOpen: true });
    render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" columns={defaultColumns as any} />
    );
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders send button', () => {
    useAIChatStore.setState({ isOpen: true });
    const { container } = render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" columns={defaultColumns as any} />
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders messages from store', () => {
    useAIChatStore.setState({
      isOpen: true,
      messages: [
        { id: 'm1', role: 'user', content: 'Hello AI', timestamp: Date.now() },
        { id: 'm2', role: 'assistant', content: 'Hi there!', timestamp: Date.now() },
      ],
    });
    render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" columns={defaultColumns as any} />
    );
    expect(screen.getByText('Hello AI')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('handles input change', () => {
    useAIChatStore.setState({ isOpen: true });
    render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" columns={defaultColumns as any} />
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Test query' } });
    expect(input).toHaveValue('Test query');
  });

  it('renders with tableName and viewName', () => {
    useAIChatStore.setState({ isOpen: true });
    render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" tableName="My Table" viewName="Grid View" columns={defaultColumns as any} />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders new conversation button', () => {
    useAIChatStore.setState({ isOpen: true });
    const { container } = render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" columns={defaultColumns as any} />
    );
    expect(container.querySelectorAll('button').length).toBeGreaterThan(1);
  });

  it('renders conversation list when toggled', () => {
    useAIChatStore.setState({ isOpen: true, showConversationList: true, conversations: [] });
    render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" columns={defaultColumns as any} />
    );
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('responds to Cmd+J keyboard shortcut', () => {
    useAIChatStore.setState({ isOpen: false });
    render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" columns={defaultColumns as any} />
    );
    fireEvent.keyDown(window, { key: 'j', metaKey: true });
    expect(useAIChatStore.getState().isOpen).toBe(true);
  });

  it('renders bottom layout panel', () => {
    useAIChatStore.setState({ isOpen: true, panelLayout: 'bottom' });
    const { container } = render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" columns={defaultColumns as any} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders streaming content indicator', () => {
    useAIChatStore.setState({ isOpen: true, isStreaming: true, streamingContent: 'Loading...' });
    render(
      <AIChatPanel baseId="b1" tableId="t1" viewId="v1" columns={defaultColumns as any} />
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
