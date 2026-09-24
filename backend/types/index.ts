export interface User {
 id: string;
 email: string;
 passwordHash: string;
 role: 'DEVELOPER' | 'LEAD';
}
export type Environment = 'DEVELOPMENT' | 'STAGING' | 'PRODUCTION';
export type ServiceStatus = 'HEALTHY' | 'DEGRADED' | 'DOWN';
export interface Microservice {
 id: string;
 name: string;
 endpointUrl: string;
 environment: Environment;
 status: ServiceStatus;
 version: string;
 ownerEmail: string;
 createdAt: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}