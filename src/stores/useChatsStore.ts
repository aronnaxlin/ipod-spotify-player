import { create } from 'zustand';

export const useChatsStore = create(() => ({
  username: 'User',
  authToken: 'mock-token',
}));
