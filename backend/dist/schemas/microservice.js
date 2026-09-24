"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateEnvironmentSchema = exports.createEnvironmentSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.createEnvironmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Title must be at least 3 characters'),
        description: zod_1.z.string().min(5, 'Description must be at least 5 characters'),
        environment: zod_1.z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION']),
    }),
});
exports.updateEnvironmentSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().min(5).optional(),
        environment: zod_1.z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION']).optional(),
        serviceStatus: zod_1.z.enum(['HEALTHY', 'DEGRADED', 'DOWN']).optional(),
    }),
});
