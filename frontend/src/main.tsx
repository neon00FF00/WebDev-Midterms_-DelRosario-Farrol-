import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { MicroserviceProvider } from './context/MicroserviceContext';
import { App } from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(<StrictMode><AuthProvider><MicroserviceProvider><App /></MicroserviceProvider></AuthProvider></StrictMode>);
