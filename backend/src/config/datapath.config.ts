// Define interfaces for configuration
interface DataPathConfig {
    path: string;
    init: string;
}

// Configuration for development environment
const developmentConfig: DataPathConfig = {
    path: './data-dev',
    init: "development"
};

const dockerConfig: DataPathConfig = {
    path: '/data',
    init: "docker"
}

// Configuration for production environment
const productionConfig: DataPathConfig = {
    path: '/data',
    init: "production"
};

// Determine environment based on NODE_ENV or default to development
const environment = process.env.NODE_ENV || 'development';

// Select the appropriate configuration based on the environment
export let dataPathConfig: DataPathConfig;

if (environment === 'production') {
    dataPathConfig = productionConfig;
} else if (environment === 'docker') {
    dataPathConfig = dockerConfig;
} else {
    dataPathConfig = developmentConfig;
}
