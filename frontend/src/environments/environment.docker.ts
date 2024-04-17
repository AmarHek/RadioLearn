export const environment = {
  production: true,
  backend: "https://projekte-ls6.informatik.uni-wuerzburg.de/radiolearn/",
  authentication: "auth/",
  database: "database/",
  images: "images/",
  assets: "assets/"
};

environment.authentication = environment.backend + environment.authentication;
environment.database = environment.backend + environment.database;
environment.images = environment.backend + environment.images;
environment.assets = environment.backend + environment.assets;


