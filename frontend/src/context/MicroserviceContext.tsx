import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { State } from '../types';

type Environment = string;
type Status = string;
type MicroserviceState = State & { microservices: any[] };
type MicroserviceAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_AUTH'; payload: { user: any; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'FETCH_SUCCESS'; payload: any[] }
  | { type: 'CREATE_SUCCESS'; payload: any }
  | { type: 'UPDATE_SUCCESS'; payload: any }
  | { type: 'DELETE_SUCCESS'; payload: string }
  | { type: 'SET_ERROR'; payload: string };

const API_BASE = 'http://localhost:5000/api';

const initialState: MicroserviceState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  services: [],
  selectedEnvironment: '',
  microservices: [],
  loading: false,
  error: null,
};

function microserviceReducer(state: MicroserviceState, action: MicroserviceAction): MicroserviceState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_AUTH':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { ...state, user: null, token: null, microservices: [] };
    case 'FETCH_SUCCESS':
      return { ...state, microservices: action.payload, loading: false };
    case 'CREATE_SUCCESS':
      return { ...state, microservices: [action.payload, ...state.microservices], loading: false };
    case 'UPDATE_SUCCESS':
      return {
        ...state,
        microservices: state.microservices.map((inc) => (inc.id === action.payload.id ? action.payload : inc)),
        loading: false,
      };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        microservices: state.microservices.filter((inc) => inc.id !== action.payload),
        loading: false,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface MicroserviceContextType {
  state: MicroserviceState;
  dispatch: React.Dispatch<MicroserviceAction>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMicroservices: () => Promise<void>;
  createMicroservice: (data: { title: string; description: string; environment: Environment }) => Promise<void>;
  updateMicroservice: (id: string, updates: Partial<{ title: string; description: string; environment: Environment; Status: Status }>) => Promise<void>;
  deleteMicroservice: (id: string) => Promise<void>;
}

const MicroserviceContext = createContext<MicroserviceContextType | undefined>(undefined);

export const MicroserviceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(microserviceReducer, initialState);

  const authFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
      ...options.headers,
    };
    const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Server error');
    }
    return data;
  };

  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch({ type: 'SET_AUTH', payload: { user: data.user, token: data.token } });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  const register = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      dispatch({ type: 'SET_AUTH', payload: { user: data.user, token: data.token } });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const fetchMicroservices = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await authFetch('/microservices');
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  const createMicroservice = async (payload: { title: string; description: string; environment: Environment }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await authFetch('/microservices', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      dispatch({ type: 'CREATE_SUCCESS', payload: data });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  const updateMicroservice = async (id: string, updates: Partial<{ title: string; description: string; environment: Environment; Status: Status }>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await authFetch(`/microservices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      dispatch({ type: 'UPDATE_SUCCESS', payload: data });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  const deleteMicroservice = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authFetch(`/microservices/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_SUCCESS', payload: id });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  useEffect(() => {
    if (state.token) {
      fetchMicroservices();
    }
  }, [state.token]);

  return (
    <MicroserviceContext.Provider
      value={{
        state,
        dispatch,
        login,
        register,
        logout,
        fetchMicroservices,
        createMicroservice,
        updateMicroservice,
        deleteMicroservice,
      }}
    >
      {children}
    </MicroserviceContext.Provider>
  );
};

export const useMicroservices = () => {
  const context = useContext(MicroserviceContext);
  if (!context) {
    throw new Error('useMicroservices must be used within an MicroserviceProvider');
  }
  return context;
};