import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const createMicroserviceSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    environment: z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION']),
  }),
});

export const updateMicroserviceSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').optional(),
    description: z.string().min(5, 'Description must be at least 5 characters').optional(),
    environment: z.enum(['DEVELOPMENT', 'STAGING', 'PRODUCTION']).optional(),
    serviceStatus: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'HEALTHY', 'DEGRADED', 'DOWN']).optional(),
  }),
});

export const createEnvironmentSchema = createMicroserviceSchema;

export const updateEnvironmentSchema = updateMicroserviceSchema;