import React, { useState } from 'react';
import { useIncidents } from './context/IncidentContext';
import { Enviroment, Status } from './types';

export const App: React.FC = () => {
  const { state, login, register, logout, createIncident, updateIncident, deleteIncident } = useIncidents();

  // Auth Form State
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Create Incident Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<Severity>('LOW');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRegister) {
      register(email, password);
    } else {
      login(email, password);
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createIncident({ title, description, severity });
    setTitle('');
    setDescription('');
    setSeverity('LOW');
  };

  if (!state.token) {
    return (
      <div style={styles.authContainer}>
        <h2>{isRegister ? 'Register' : 'Login'} - ServiceHub</h2>
        {state.error && <p style={styles.error}>{state.error}</p>}
        <form onSubmit={handleAuthSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button type="submit" disabled={state.loading} style={styles.button}>
            {state.loading ? 'Processing...' : isRegister ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <button onClick={() => setIsRegister(!isRegister)} style={styles.linkButton}>
          {isRegister ? 'Already have an account? Log In' : "Don't have an account? Register"}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <h1>PulseDesk Incident Center</h1>
        <div>
          <span>User: {state.user?.email}</span>
          <button onClick={logout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {state.error && <p style={styles.error}>{state.error}</p>}

      <section style={styles.section}>
        <h3>Submit Incident Ticket</h3>
        <form onSubmit={handleCreateSubmit} style={styles.createForm}>
          <input
            type="text"
            placeholder="Incident Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={styles.input}
          />
          <textarea
            placeholder="Incident Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            style={styles.textarea}
          />
          <select value={severity} onChange={(e) => setEnviroment(e.target.value as Enviroment)} style={styles.select}>
            <option value="DEVELOPMENT">DEVELOPMENT</option>
            <option value="STAGING">STAGING</option>
            <option value="PRODUCTION">PRODUCTION</option>
          </select>
          <button type="submit" disabled={state.loading} style={styles.button}>Submit Ticket</button>
        </form>
      </section>

      <section style={styles.section}>
        <h3>Active Incidents ({state.incidents.length})</h3>
        {state.loading && <p>Loading incidents...</p>}
        <div style={styles.cardList}>
          {state.incidents.map((incident) => (
            <div key={incident.id} style={styles.card}>
              <h4>{incident.title}</h4>
              <p>{incident.description}</p>
              <div style={styles.cardMeta}>
                <span><strong>Severity:</strong> {incident.severity}</span>
                <span>
                  <strong>Status:</strong>{' '}
                  <select
                    value={incident.status}
                    onChange={(e) => updateIncident(incident.id, { status: e.target.value as Status })}
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </span>
              </div>
              <button onClick={() => deleteIncident(incident.id)} style={styles.deleteBtn}>
                Delete Ticket
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  authContainer: { maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' },
  dashboard: { padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #333', paddingBottom: '10px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  createForm: { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '500px' },
  input: { padding: '8px', fontSize: '14px' },
  textarea: { padding: '8px', fontSize: '14px', height: '80px' },
  select: { padding: '8px', fontSize: '14px' },
  button: { padding: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  logoutBtn: { marginLeft: '10px', padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px' },
  deleteBtn: { marginTop: '10px', padding: '5px 10px', backgroundColor: '#d9534f', color: '#fff', border: 'none', borderRadius: '4px' },
  linkButton: { marginTop: '10px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' },
  error: { color: 'red' },
  section: { marginTop: '20px' },
  cardList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' },
  card: { padding: '15px', border: '1px solid #ddd', borderRadius: '6px', backgroundColor: '#f9f9f9' },
  cardMeta: { display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '10px' },
};