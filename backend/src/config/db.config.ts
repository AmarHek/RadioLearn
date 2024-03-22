interface DataBaseConfig {
    HOST: string;
    PORT: number;
    DB: string;
}

// Configuration for development and production environment
// (i.e. mongoDB running on local machine)
const localConfig: DataBaseConfig = {
    HOST: "127.0.0.1",
    PORT: 27017,
    DB: "radiolearn"
};

// Configuration for running in a docker-compose environment
const dockerConfig: DataBaseConfig = {
    HOST: "radiolearn-mongodb",
    PORT: 27017,
    DB: "radiolearn"
};

// Determine environment based on NODE_ENV or default to development
const environment = process.env.NODE_ENV || 'development';

export let dbConfig: DataBaseConfig;

if (environment === 'docker') {
    dbConfig = dockerConfig;
} else {
    dbConfig = localConfig;
}