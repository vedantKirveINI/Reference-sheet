import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareModal } from '../share-modal';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        share: 'Share',
        add: 'Add',
        search: 'Search',
        loading: 'Loading...',
        'auth.email': 'Email',
        'sharing.shareLink': 'Share link',
        'sharing.viewer': 'Viewer',
        'sharing.editor': 'Editor',
        'sharing.fullAccess': 'Full access',
        'sharing.generalAccess': 'General access',
        'sharing.restricted': 'Restricted',
        'sharing.anyoneView': 'Anyone can view',
        'sharing.anyoneEdit': 'Anyone can edit',
        'sharing.copyLink': 'Copy link',
        'sharing.linkCopied': 'Link copied!',
      };
      return map[key] || key;
    },
    i18n: { language: 'en', changeLanguage: vi.fn() },
  }),
}));

const mockCloseShareModal = vi.fn();

vi.mock('@/stores', () => ({
  useModalControlStore: () => ({
    shareModal: true,
    closeShareModal: mockCloseShareModal,
  }),
}));

vi.mock('@/services/api', () => ({
  getShareMembers: vi.fn().mockResolvedValue({ data: { members: [] } }),
  inviteShareMember: vi.fn().mockResolvedValue({ data: { id: 'user-1' } }),
  updateShareMemberRole: vi.fn().mockResolvedValue({ data: {} }),
  removeShareMember: vi.fn().mockResolvedValue({ data: {} }),
  updateGeneralAccess: vi.fn().mockResolvedValue({ data: {} }),
}));

describe('ShareModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders share dialog', () => {
    render(<ShareModal baseId="base-1" />);
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('renders email input', () => {
    render(<ShareModal baseId="base-1" />);
    const emailInputs = screen.getAllByPlaceholderText('Email');
    expect(emailInputs.length).toBeGreaterThan(0);
  });

  it('renders permission selector', () => {
    render(<ShareModal baseId="base-1" />);
    expect(screen.getAllByText('Viewer').length).toBeGreaterThan(0);
  });

  it('renders Add button', () => {
    render(<ShareModal baseId="base-1" />);
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('renders share link section', () => {
    render(<ShareModal baseId="base-1" />);
    expect(screen.getAllByText('Share link').length).toBeGreaterThan(0);
  });

  it('renders copy link button', () => {
    render(<ShareModal baseId="base-1" />);
    expect(screen.getByText('Copy link')).toBeInTheDocument();
  });

  it('renders general access section', () => {
    render(<ShareModal baseId="base-1" />);
    expect(screen.getAllByText('General access').length).toBeGreaterThan(0);
  });

  it('renders general access dropdown with options', () => {
    render(<ShareModal baseId="base-1" />);
    expect(screen.getByText('Restricted')).toBeInTheDocument();
  });

  it('shows share link URL', () => {
    render(<ShareModal baseId="base-1" tableId="tbl_123" />);
    expect(screen.getByText(/sheets\.app\/s\//)).toBeInTheDocument();
  });

  it('adds collaborator when email is entered and Add is clicked', async () => {
    const user = userEvent.setup();
    render(<ShareModal baseId="base-1" />);
    const emailInputs = screen.getAllByPlaceholderText('Email');
    await user.type(emailInputs[0], 'test@example.com');
    await user.click(screen.getByText('Add'));
    await waitFor(() => {
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('does not add collaborator with invalid email', async () => {
    const user = userEvent.setup();
    render(<ShareModal baseId="base-1" />);
    const emailInputs = screen.getAllByPlaceholderText('Email');
    await user.type(emailInputs[0], 'invalid');
    await user.click(screen.getByText('Add'));
    expect(screen.queryByText('invalid')).not.toBeInTheDocument();
  });

  it('shows "No collaborators added yet." when empty', async () => {
    render(<ShareModal baseId="base-1" />);
    await waitFor(() => {
      expect(screen.getByText('No collaborators added yet.')).toBeInTheDocument();
    });
  });
});
