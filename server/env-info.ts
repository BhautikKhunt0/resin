import { config } from './config';

export function getAdminCredentialsInfo() {
  return {
    email: config.admin.email,
    // Note: Never expose the actual password or hash
    passwordNote: "Password is stored securely as a hash in environment variables"
  };
}

export function getEnvironmentInfo() {
  return {
    mongodb: {
      connected: true,
      database: config.mongodb.uri.includes('mongodb') ? 'MongoDB Atlas' : 'Local MongoDB'
    },
    email: {
      service: config.email.service,
      user: config.email.user,
      configured: true
    },
    admin: {
      email: config.admin.email,
      hasPasswordHash: !!config.admin.passwordHash
    },
    server: {
      port: config.server.port,
      environment: config.server.nodeEnv
    }
  };
}