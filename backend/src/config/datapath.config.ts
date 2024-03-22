// Define interfaces for configuration
interface DataPathConfig {
    path: string;
}

// Configuration for development environment
const developmentConfig: DataPathConfig = {
    path: './data' // Use relative path for development
};

// Configuration for production environment
const productionConfig: DataPathConfig = {
    path: '/data' // Use absolute path for production
};

// Determine environment based on NODE_ENV or default to development
const environment = process.env.NODE_ENV || 'development';

// Select the appropriate configuration based on the environment
export let dataPathConfig: DataPathConfig;

if (environment === 'production' || environment === 'docker') {
    dataPathConfig = productionConfig;
} else {
    dataPathConfig = developmentConfig;
}
