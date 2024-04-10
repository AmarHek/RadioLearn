import express from 'express';
import multer from 'multer';
import fs from "fs";
import * as Path from "path";
import {dataPathConfig} from "../config";

import * as TemplateController from "../controllers/template.controller";

const storageExcel = multer.diskStorage({
    destination: (req, file, cb) => {
        const path = Path.join(dataPathConfig.path, "excels");
        fs.mkdirSync(path, { recursive: true });
        cb(null, path);
    },
    filename: (req, file, cb) => {
        const name = req.body.name + ".xlsx";
        cb(null, name);
    }
});

export const templateRouter = express.Router();

templateRouter.post("/excel", multer({
    storage: storageExcel
}).single("file"), TemplateController.createExcelTemplate);
templateRouter.post("/add/", TemplateController.createTemplate);
templateRouter.put("/update/:id", TemplateController.updateTemplate);
templateRouter.get('/list/', TemplateController.getTemplateList);
templateRouter.post('/listAsString/', TemplateController.getTemplateListAsString);
templateRouter.get("/:id", TemplateController.getTemplateById)
templateRouter.delete("/delete/:id", TemplateController.deleteTemplate);
templateRouter.post("/getByName/", TemplateController.getTemplateByName);
templateRouter.post("/getByKind/", TemplateController.getTemplatesByKind)
