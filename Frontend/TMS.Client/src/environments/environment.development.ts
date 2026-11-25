import { AppEnvironment } from './environment.model';

export const environment: AppEnvironment = {
  production: false,
  // Routed through Angular dev proxy (proxy.conf.json -> https://localhost:7068)
  apiBaseUrl: '/api',
};
