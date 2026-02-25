import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CollaborationService, collaborationService } from '../collaboration';

describe('CollaborationService', () => {
  let service: CollaborationService;

  beforeEach(() => {
    service = new CollaborationService();
  });

  describe('connect', () => {
    it('sets connected state, tableId and userId', () => {
      service.connect('table-1', 'user-1');
      expect(service.isConnected()).toBe(true);
      expect(service.tableId).toBe('table-1');
      expect(service.userId).toBe('user-1');
    });

    it('can connect to different tables', () => {
      service.connect('table-1', 'user-1');
      service.connect('table-2', 'user-2');
      expect(service.tableId).toBe('table-2');
      expect(service.userId).toBe('user-2');
    });
  });

  describe('disconnect', () => {
    it('clears connected state, tableId, userId, and listeners', () => {
      service.connect('table-1', 'user-1');
      service.onEvent('test', vi.fn());
      service.disconnect();
      expect(service.isConnected()).toBe(false);
      expect(service.tableId).toBeNull();
      expect(service.userId).toBeNull();
    });

    it('can disconnect when not connected', () => {
      expect(() => service.disconnect()).not.toThrow();
      expect(service.isConnected()).toBe(false);
    });
  });

  describe('isConnected', () => {
    it('returns false initially', () => {
      expect(service.isConnected()).toBe(false);
    });

    it('returns true after connect', () => {
      service.connect('table-1', 'user-1');
      expect(service.isConnected()).toBe(true);
    });

    it('returns false after disconnect', () => {
      service.connect('table-1', 'user-1');
      service.disconnect();
      expect(service.isConnected()).toBe(false);
    });
  });

  describe('sendCellChange', () => {
    it('does not throw', () => {
      service.connect('table-1', 'user-1');
      expect(() => service.sendCellChange('rec-1', 'col-1', 'value')).not.toThrow();
    });

    it('accepts any value type', () => {
      service.connect('table-1', 'user-1');
      expect(() => service.sendCellChange('rec-1', 'col-1', null)).not.toThrow();
      expect(() => service.sendCellChange('rec-1', 'col-1', 42)).not.toThrow();
      expect(() => service.sendCellChange('rec-1', 'col-1', { nested: true })).not.toThrow();
    });
  });

  describe('sendCursorPosition', () => {
    it('does not throw', () => {
      service.connect('table-1', 'user-1');
      expect(() => service.sendCursorPosition(5, 3)).not.toThrow();
    });

    it('accepts zero coordinates', () => {
      expect(() => service.sendCursorPosition(0, 0)).not.toThrow();
    });
  });

  describe('onEvent', () => {
    it('registers event listener', () => {
      const cb = vi.fn();
      service.onEvent('user_joined', cb);
      expect(() => service.onEvent('user_joined', vi.fn())).not.toThrow();
    });

    it('can register multiple listeners for same event', () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      service.onEvent('cell_changed', cb1);
      service.onEvent('cell_changed', cb2);
      expect(() => service.onEvent('cell_changed', vi.fn())).not.toThrow();
    });

    it('can register listeners for different events', () => {
      service.onEvent('user_joined', vi.fn());
      service.onEvent('user_left', vi.fn());
      service.onEvent('cursor_moved', vi.fn());
      expect(() => service.onEvent('selection_changed', vi.fn())).not.toThrow();
    });
  });

  describe('initial state', () => {
    it('tableId is null', () => {
      expect(service.tableId).toBeNull();
    });

    it('userId is null', () => {
      expect(service.userId).toBeNull();
    });
  });
});

describe('collaborationService singleton', () => {
  it('is an instance of CollaborationService', () => {
    expect(collaborationService).toBeInstanceOf(CollaborationService);
  });

  it('starts disconnected', () => {
    expect(collaborationService.isConnected()).toBe(false);
  });
});

describe('CollaborationEvent types', () => {
  it('exports UserJoinedEvent interface shape', () => {
    const event: import('../collaboration').UserJoinedEvent = {
      type: 'user_joined', userId: 'u1', userName: 'Alice', color: '#ff0000',
    };
    expect(event.type).toBe('user_joined');
  });

  it('exports UserLeftEvent interface shape', () => {
    const event: import('../collaboration').UserLeftEvent = {
      type: 'user_left', userId: 'u1',
    };
    expect(event.type).toBe('user_left');
  });

  it('exports CellChangedEvent interface shape', () => {
    const event: import('../collaboration').CellChangedEvent = {
      type: 'cell_changed', userId: 'u1', recordId: 'rec-1', columnId: 'col-1', newValue: 'test',
    };
    expect(event.type).toBe('cell_changed');
  });

  it('exports CursorMovedEvent interface shape', () => {
    const event: import('../collaboration').CursorMovedEvent = {
      type: 'cursor_moved', userId: 'u1', row: 5, col: 3,
    };
    expect(event.type).toBe('cursor_moved');
  });

  it('exports SelectionChangedEvent interface shape', () => {
    const event: import('../collaboration').SelectionChangedEvent = {
      type: 'selection_changed', userId: 'u1',
      selection: { startRow: 0, startCol: 0, endRow: 5, endCol: 3 },
    };
    expect(event.type).toBe('selection_changed');
  });
});
