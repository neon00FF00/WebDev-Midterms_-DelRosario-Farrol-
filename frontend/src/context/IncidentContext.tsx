import React, { createContext, useReducer, useContext, ReactNode, useEffect } from 'react';
import { State, Action, Incident, Severity, Status } from '../types';

const API_BASE = 'http://localhost:5000/api';

const initialState: State = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  incidents: [],
  loading: false,
  error: null,
};

function incidentReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_AUTH':
      return { ...state, user: action.payload.user, token: action.payload.token, loading: false };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { ...state, user: null, token: null, incidents: [] };
    case 'FETCH_SUCCESS':
      return { ...state, incidents: action.payload, loading: false };
    case 'CREATE_SUCCESS':
      return { ...state, incidents: [action.payload, ...state.incidents], loading: false };
    case 'UPDATE_SUCCESS':
      return {
        ...state,
        incidents: state.incidents.map((inc) => (inc.id === action.payload.id ? action.payload : inc)),
        loading: false,
      };
    case 'DELETE_SUCCESS':
      return {
        ...state,
        incidents: state.incidents.filter((inc) => inc.id !== action.payload),
        loading: false,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

interface IncidentContextType {
  state: State;
  dispatch: React.Dispatch<Action>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchIncidents: () => Promise<void>;
  createIncident: (data: { title: string; description: string; severity: Severity }) => Promise<void>;
  updateIncident: (id: string, updates: Partial<{ title: string; description: string; severity: Severity; status: Status }>) => Promise<void>;
  deleteIncident: (id: string) => Promise<void>;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(incidentReducer, initialState);

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

  const fetchIncidents = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await authFetch('/incidents');
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  const createIncident = async (payload: { title: string; description: string; severity: Severity }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await authFetch('/incidents', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      dispatch({ type: 'CREATE_SUCCESS', payload: data });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  const updateIncident = async (id: string, updates: Partial<{ title: string; description: string; severity: Severity; status: Status }>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const data = await authFetch(`/incidents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      dispatch({ type: 'UPDATE_SUCCESS', payload: data });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  const deleteIncident = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await authFetch(`/incidents/${id}`, { method: 'DELETE' });
      dispatch({ type: 'DELETE_SUCCESS', payload: id });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  useEffect(() => {
    if (state.token) {
      fetchIncidents();
    }
  }, [state.token]);

  return (
    <IncidentContext.Provider
      value={{
        state,
        dispatch,
        login,
        register,
        logout,
        fetchIncidents,
        createIncident,
        updateIncident,
        deleteIncident,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (!context) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
};