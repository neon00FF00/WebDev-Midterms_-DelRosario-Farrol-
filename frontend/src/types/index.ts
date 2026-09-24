export interface State {
 user: { id: string; email: string; role: string } | null;
 token: string | null;
 services: Microservice[];
 selectedEnvironment: Environment | 'ALL';
 loading: boolean;
 error: string | null;
}
export type Action =
 | { type: 'SET_AUTH'; payload: { user: any; token: string } }
 | { type: 'LOGOUT' }
 | { type: 'SET_ENV_FILTER'; payload: Environment | 'ALL' }
 | { type: 'FETCH_SERVICES_SUCCESS'; payload: Microservice[] }
 | { type: 'CREATE_SERVICE_SUCCESS'; payload: Microservice }
 | { type: 'UPDATE_SERVICE_SUCCESS'; payload: Microservice }
 | { type: 'DELETE_SERVICE_SUCCESS'; payload: string }
 | { type: 'SET_ERROR'; payload: string | null }