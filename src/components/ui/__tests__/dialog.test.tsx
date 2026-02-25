import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../dialog';

describe('Dialog', () => {
  it('renders content when open', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Dialog</DialogTitle>
            <DialogDescription>Test description</DialogDescription>
          </DialogHeader>
          <p>Dialog body</p>
          <DialogFooter>
            <button>OK</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('Dialog body')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'OK' })).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <Dialog open={false}>
        <DialogContent>
          <DialogTitle>Hidden</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
  });

  it('renders close button by default', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>With Close</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>No Close</DialogTitle>
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByLabelText('Close')).not.toBeInTheDocument();
  });

  it('renders DialogFooter with close button when showCloseButton is true', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Footer Close</DialogTitle>
          <DialogFooter showCloseButton>
            <button>Submit</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
  });
});
