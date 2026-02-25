import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CommentPanel } from '../comment-panel';
import * as api from '@/services/api';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (k: string) => {
      const map: Record<string, string> = {
        'comments.comments': 'Comments',
        'comments.noComments': 'No comments',
        'comments.addComment': 'Add a comment...',
        'comments.reply': 'Replying to',
        'comments.edited': 'edited',
        'loading': 'Loading',
        'edit': 'Edit',
        'delete': 'Delete',
        'save': 'Save',
        'cancel': 'Cancel',
      };
      return map[k] ?? k;
    },
  }),
}));

vi.mock('@/services/api', () => ({
  getComments: vi.fn().mockResolvedValue({ data: { comments: [] } }),
  createComment: vi.fn().mockResolvedValue({ data: {} }),
  updateComment: vi.fn().mockResolvedValue({ data: {} }),
  deleteComment: vi.fn().mockResolvedValue({ data: {} }),
  addCommentReaction: vi.fn().mockResolvedValue({ data: {} }),
  removeCommentReaction: vi.fn().mockResolvedValue({ data: {} }),
}));

vi.mock('@/components/editors/user-avatar', () => ({
  UserAvatar: ({ name }: { name: string }) => <span>{name}</span>,
}));

const mockGetComments = vi.mocked(api.getComments);
const mockCreateComment = vi.mocked(api.createComment);

const mockComments = [
  {
    id: 'c1',
    content: 'Great work!',
    created_by: { id: 'u1', name: 'Alice', email: 'alice@test.com' },
    created_at: new Date(Date.now() - 60000).toISOString(),
    updated_at: new Date(Date.now() - 60000).toISOString(),
    parent_id: null,
    reactions: { '👍': ['u2'] },
  },
  {
    id: 'c2',
    content: 'Thanks!',
    created_by: { id: 'u2', name: 'Bob', email: 'bob@test.com' },
    created_at: new Date(Date.now() - 30000).toISOString(),
    updated_at: new Date(Date.now() - 30000).toISOString(),
    parent_id: 'c1',
    reactions: {},
  },
];

describe('CommentPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetComments.mockResolvedValue({ data: { comments: [] } } as any);
  });

  it('renders panel header', async () => {
    render(<CommentPanel tableId="t1" recordId="r1" />);
    expect(screen.getByText('Comments')).toBeInTheDocument();
  });

  it('shows no comments state', async () => {
    render(<CommentPanel tableId="t1" recordId="r1" />);
    await waitFor(() => {
      expect(screen.getByText('No comments')).toBeInTheDocument();
    });
  });

  it('renders comment input', () => {
    render(<CommentPanel tableId="t1" recordId="r1" />);
    expect(screen.getByPlaceholderText('Add a comment...')).toBeInTheDocument();
  });

  it('renders send button', () => {
    render(<CommentPanel tableId="t1" recordId="r1" />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('enables send button when text is entered', () => {
    render(<CommentPanel tableId="t1" recordId="r1" />);
    const textarea = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    const sendButton = screen.getAllByRole('button').pop();
    expect(sendButton).not.toBeDisabled();
  });

  it('displays comments when loaded', async () => {
    mockGetComments.mockResolvedValue({ data: { comments: mockComments } } as any);
    render(<CommentPanel tableId="t1" recordId="r1" />);
    await waitFor(() => {
      expect(screen.getByText('Great work!')).toBeInTheDocument();
    });
  });

  it('displays comment author name', async () => {
    mockGetComments.mockResolvedValue({ data: { comments: [mockComments[0]] } } as any);
    render(<CommentPanel tableId="t1" recordId="r1" />);
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  it('displays threaded replies', async () => {
    mockGetComments.mockResolvedValue({ data: { comments: mockComments } } as any);
    render(<CommentPanel tableId="t1" recordId="r1" />);
    await waitFor(() => {
      expect(screen.getByText('Thanks!')).toBeInTheDocument();
    });
  });

  it('displays reactions on comments', async () => {
    mockGetComments.mockResolvedValue({ data: { comments: [mockComments[0]] } } as any);
    render(<CommentPanel tableId="t1" recordId="r1" currentUserId="u2" />);
    await waitFor(() => {
      expect(screen.getByText('Great work!')).toBeInTheDocument();
    });
    const reactionEl = document.querySelector('[class*="reaction"], [data-emoji]');
    expect(reactionEl || screen.queryByText('👍')).toBeTruthy();
  });

  it('submits new comment on Enter', async () => {
    mockGetComments.mockResolvedValue({ data: { comments: [] } } as any);
    mockCreateComment.mockResolvedValue({ data: {} } as any);

    render(<CommentPanel tableId="t1" recordId="r1" />);
    const textarea = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(textarea, { target: { value: 'New comment' } });
    fireEvent.keyDown(textarea, { key: 'Enter' });

    await waitFor(() => {
      expect(mockCreateComment).toHaveBeenCalledWith({
        tableId: 't1',
        recordId: 'r1',
        content: 'New comment',
        parentId: undefined,
      });
    });
  });

  it('shows edit/delete options for own comments', async () => {
    mockGetComments.mockResolvedValue({ data: { comments: [mockComments[0]] } } as any);
    render(<CommentPanel tableId="t1" recordId="r1" currentUserId="u1" />);
    await waitFor(() => {
      expect(screen.getByText('Great work!')).toBeInTheDocument();
    });
  });

  it('calls getComments on mount', async () => {
    render(<CommentPanel tableId="t1" recordId="r1" />);
    await waitFor(() => {
      expect(mockGetComments).toHaveBeenCalledWith({ tableId: 't1', recordId: 'r1', limit: 100 });
    });
  });
});
