import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  rol: 'SUPERADMIN' | 'TIENDA';
  tiendaId: string | null;
}

interface SessionState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (user: User, token: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  user: JSON.parse(localStorage.getItem('luzsport_user') || 'null'),
  token: localStorage.getItem('luzsport_token'),
  isAuthenticated: !!localStorage.getItem('luzsport_token'),
  setSession: (user, token) => {
    localStorage.setItem('luzsport_token', token);
    localStorage.setItem('luzsport_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  clearSession: () => {
    localStorage.removeItem('luzsport_token');
    localStorage.removeItem('luzsport_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
