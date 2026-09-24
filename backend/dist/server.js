"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const auth_1 = require("./middleware/auth");
const validate_1 = require("./middleware/validate");
const microservice_schema_1 = require("./schemas/microservice.schema");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'servicehub_super_secret_key';
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// In-Memory Database
const users = [];
const microservice = [];
// Auth Routes
app.post('/api/auth/register', (0, validate_1.validate)(microservice_schema_1.registerSchema), async (req, res) => {
    const { email, password } = req.body;
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const newUser = { id: (0, uuid_1.v4)(), email, passwordHash };
    users.push(newUser);
    const token = jsonwebtoken_1.default.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ token, user: { id: newUser.id, email: newUser.email } });
});
app.post('/api/auth/login', (0, validate_1.validate)(microservice_schema_1.loginSchema), async (req, res) => {
    const { email, password } = req.body;
    const user = users.find((u) => u.email === email);
    if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }
    const validPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!validPassword) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email } });
});
// microservice Routes (Full CRUD)
app.get('/api/microservice', auth_1.authenticateToken, (_req, res) => {
    res.json(microservice);
});
app.post('/api/microservice', auth_1.authenticateToken, (0, validate_1.validate)(microservice_schema_1.createMicroserviceSchema), (req, res) => {
    const { title, description, environment } = req.body;
    const newMicroservice = {
        id: (0, uuid_1.v4)(),
        title,
        description,
        environment,
        serviceStatus: 'OPEN',
        createdById: req.user.id,
        createdAt: new Date().toISOString(),
    };
    microservice.push(newMicroservice);
    res.status(201).json(newMicroservice);
});
app.put('/api/microservice/:id', auth_1.authenticateToken, (0, validate_1.validate)(microservice_schema_1.updateMicroserviceSchema), (req, res) => {
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
app.delete('/api/microservices/:id', auth_1.authenticateToken, (req, res) => {
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
