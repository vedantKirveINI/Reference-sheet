import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, getToken } from './api';

let socket: Socket | null = null;

export const connectSocket = (token?: string): Socket => {
  if (socket?.connected) return socket;

  const authToken = token || getToken();

  socket = io(API_BASE_URL, {
    query: { token: authToken },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err.message);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
