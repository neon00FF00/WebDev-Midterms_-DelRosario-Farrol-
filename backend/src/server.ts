import express, { Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { User, Enviroment, AuthRequest } from './types';
import { authenticateToken } from './middleware/auth';
import { validate } from './middleware/validate';
import { registerSchema, loginSchema, createEnviromentSchema, updateEnviromentSchema } from './schemas/enviroment.schema';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'servicehub_super_secret_key';

app.use(cors());
app.use(express.json());

// In-Memory Database
const users: User[] = [];
const incidents: Incident[] = [];

// Auth Routes
app.post('/api/auth/register', validate(registerSchema), async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser: User = { id: uuidv4(), email, passwordHash };
  users.push(newUser);

  const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ token, user: { id: newUser.id, email: newUser.email } });
});

app.post('/api/auth/login', validate(loginSchema), async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { id: user.id, email: user.email } });
});

// Incident Routes (Full CRUD)
app.get('/api/incidents', authenticateToken, (_req: AuthRequest, res: Response) => {
  res.json(incidents);
});

app.post('/api/incidents', authenticateToken, validate(createIncidentSchema), (req: AuthRequest, res: Response) => {
  const { title, description, severity } = req.body;

  const newIncident: Incident = {
    id: uuidv4(),
    title,
    description,
    severity,
    status: 'OPEN',
    createdById: req.user!.id,
    createdAt: new Date().toISOString(),
  };

  incidents.push(newIncident);
  res.status(201).json(newIncident);
});

app.put('/api/incidents/:id', authenticateToken, validate(updateIncidentSchema), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const incidentIndex = incidents.findIndex((i) => i.id === id);

  if (incidentIndex === -1) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const existingIncident = incidents[incidentIndex];
  const updatedIncident = {
    ...existingIncident,
    ...req.body,
  };

  incidents[incidentIndex] = updatedIncident;
  res.json(updatedIncident);
});

app.delete('/api/incidents/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const incidentIndex = incidents.findIndex((i) => i.id === id);

  if (incidentIndex === -1) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  incidents.splice(incidentIndex, 1);
  res.json({ message: 'Incident deleted successfully', id });
});

app.listen(PORT, () => {
  console.log(`PulseDesk Backend running on http://localhost:${PORT}`);
});