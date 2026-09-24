import express, { Response } from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { User, Microservice, AuthRequest } from '../types';
import { authenticateToken } from './middleware/auth';
import { validate } from './middleware/validate';
import { registerSchema, loginSchema, createMicroserviceSchema, updateMicroserviceSchema } from './schemas/microservice.schema';

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'servicehub_super_secret_key';

app.use(cors());
app.use(express.json());

// In-Memory Database
const users: User[] = [];
const microservice: Microservice[] = [];

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

// microservice Routes (Full CRUD)
app.get('/api/microservice', authenticateToken, (_req: AuthRequest, res: Response) => {
  res.json(microservice);
});

app.post('/api/microservice', authenticateToken, validate(createMicroserviceSchema), (req: AuthRequest, res: Response) => {
  const { title, description, environment } = req.body;

  const newMicroservice: Microservice = {
    id: uuidv4(),
    title,
    description,
    environment,
    serviceStatus: 'OPEN',
    createdById: req.user!.id,
    createdAt: new Date().toISOString(),
  };

  microservice.push(newMicroservice);
  res.status(201).json(newMicroservice);
});

app.put('/api/microservice/:id', authenticateToken, validate(updateMicroserviceSchema), (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const microserviceIndex = microservice.findIndex((i) => i.id === id);

  if (microserviceIndex === -1) {
    return res.status(404).json({ error: 'Microservice not found' });
  }

  const existingMicroservice = microservice[microserviceIndex];
  const updatedMicroservice = {
    ...existingMicroservice,
    ...req.body,
  };

  microservice[microserviceIndex] = updatedMicroservice;
  res.json(updatedMicroservice);
});

app.delete('/api/microservices/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const microserviceIndex = microservice.findIndex((i) => i.id === id);

  if (microserviceIndex === -1) {
    return res.status(404).json({ error: 'Microservice not found' });
  }

  microservice.splice(microserviceIndex, 1);
  res.json({ message: 'Microservice deleted successfully', id });
});

app.listen(PORT, () => {
  console.log(`MicroService Backend running on http://localhost:${PORT}`);
});