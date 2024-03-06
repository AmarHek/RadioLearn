import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import path from "path";
import {dbConfig} from "./config";
import cors from "cors";

import {matRouter, templateRouter, userRouter, authRouter} from './routes';
import {initData} from "./init";
import {feedbackRouter} from "./routes/feedback.routes";
import {usageRouter} from "./routes/usage.routes";

export const app = express();

// TODO: Auf env auslagern

const url = "mongodb://" + dbConfig.HOST + ":" + dbConfig.PORT + "/" + dbConfig.DB;
mongoose.connect(url)
  .then(() => {
    console.log("Connected to Database");
    initData();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });


app.use(cors({
    origin: "*"
}))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use("/images", express.static(path.join(__dirname, "../data/images")));
app.use("/", express.static(path.join(__dirname, "../dist/radiolearn")));
app.use("/assets", express.static(path.join(__dirname, "./assets/img")));
app.set("view engine", "ejs");

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token, Origin, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE');
    next();
});

app.use("/auth", authRouter);
app.use("/auth", userRouter);

app.use("/database/usage", usageRouter);
app.use("/database/material", matRouter);
app.use("/database/template", templateRouter);
app.use("/database/feedback", feedbackRouter);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/radiolearn/index.html"));
});

