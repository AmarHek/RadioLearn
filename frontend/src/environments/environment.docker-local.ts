export const environment = {
  production: true,
  backend: "http://localhost:8000/",
  authentication: "auth/",
  database: "database/",
  images: "images/",
  assets: "assets/"
};

environment.authentication = environment.backend + environment.authentication;
environment.database = environment.backend + environment.database;
environment.images = environment.backend + environment.images;
environment.assets = environment.backend + environment.assets;
