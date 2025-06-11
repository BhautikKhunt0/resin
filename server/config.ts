import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export interface AppConfig {
  // Database Configuration
  mongodb: {
    uri: string;
  };
  
  // Email Configuration
  email: {
    user: string;
    password: string;
    from: string;
    service: string;
  };
  
  // Admin Configuration
  admin: {
    email: string;
    passwordHash: string;
  };
  
  // JWT Configuration
  jwt: {
    secret: string;
  };
  
  // Server Configuration
  server: {
    port: number;
    nodeEnv: string;
  };
}

function validateRequiredEnvVar(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config: AppConfig = {
  mongodb: {
    uri: validateRequiredEnvVar('MONGODB_URI', process.env.MONGODB_URI),
  },
  
  email: {
    user: validateRequiredEnvVar('EMAIL_USER', process.env.EMAIL_USER),
    password: validateRequiredEnvVar('EMAIL_PASS', process.env.EMAIL_PASS),
    from: validateRequiredEnvVar('EMAIL_FROM', process.env.EMAIL_FROM),
    service: process.env.EMAIL_SERVICE || 'gmail',
  },
  
  admin: {
    email: validateRequiredEnvVar('ADMIN_EMAIL', process.env.ADMIN_EMAIL),
    passwordHash: validateRequiredEnvVar('ADMIN_PASSWORD_HASH', process.env.ADMIN_PASSWORD_HASH),
  },
  
  jwt: {
    secret: validateRequiredEnvVar('JWT_SECRET', process.env.JWT_SECRET),
  },
  
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
};

// Validate configuration on module load
console.log('✓ Environment configuration loaded successfully');
console.log(`✓ Database: ${config.mongodb.uri.includes('mongodb') ? 'MongoDB configured' : 'Invalid MongoDB URI'}`);
console.log(`✓ Email: ${config.email.user}`);
console.log(`✓ Admin: ${config.admin.email}`);
console.log(`✓ Server: Port ${config.server.port}, Environment: ${config.server.nodeEnv}`);