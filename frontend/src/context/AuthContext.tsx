import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react';
import type { User } from '../types';

interface AuthState { token: string | null; user: User | null; }
type Action = { type: 'restore'; payload: AuthState } | { type: 'logout' };
const initialState: AuthState = { token: localStorage.getItem('pulsedesk_token'), user: null };
const AuthContext = createContext<{ state: AuthState; logout: () => void }>({ state: initialState, logout: () => undefined });

function reducer(state: AuthState, action: Action): AuthState {
  if (action.type === 'restore') return action.payload;
  localStorage.removeItem('pulsedesk_token');
  return { token: null, user: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  useEffect(() => {
    if (!state.token) return;
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${state.token}` } }).then(async (response) => {
      if (response.ok) dispatch({ type: 'restore', payload: { token: state.token, user: await response.json() } });
      else dispatch({ type: 'logout' });
    }).catch(() => undefined);
  }, [state.token]);
  return <AuthContext.Provider value={{ state, logout: () => dispatch({ type: 'logout' }) }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
