import express from "express";
import * as UsageController from "../controllers/usage.controller";

export const usageRouter = express.Router()
usageRouter.post("/addRadiolearnData/", UsageController.saveRadiolearnData);
