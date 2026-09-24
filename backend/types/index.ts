import type { Request } from 'express';

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role?: 'DEVELOPER' | 'LEAD';
}

export type Environment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
export type ServiceStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'HEALTHY' | 'DEGRADED' | 'DOWN';

export interface Microservice {
  id: string;
  title: string;
  description: string;
  environment: Environment;
  serviceStatus: ServiceStatus;
  createdById: string;
  createdAt: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}