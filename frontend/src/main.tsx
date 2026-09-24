import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { IncidentProvider } from './context/IncidentContext';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(<StrictMode><AuthProvider><IncidentProvider><App /></IncidentProvider></AuthProvider></StrictMode>);
