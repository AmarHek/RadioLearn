import {TemplateDB} from '../models';
import * as fs from 'fs';
import {Request, Response} from "express";
import {parseXLSToJson} from "../middleware";
import * as Path from "path";
import {generateUniqueFilename} from "../util/util";
import {RowErrorCollection} from "../middleware/errorFeedback";


export function createExcelTemplate(req: any, res: Response) {
    const rawData = fs.readFileSync(req.file.path);
    const result = parseXLSToJson(rawData.toString("binary"), req.body.kind);
    if (typeof(result) === "object") {
        const errorCollection = result as RowErrorCollection
        console.log("Errors found: " + errorCollection.getCompactReport());
        res.status(500).send({
            message: errorCollection.getVerboseReport()
        });
    } else {
        // save parsed data to json
        const jsonName = generateUniqueFilename("data/json", req.body.name, ".json");
        const templateName = jsonName.replace(".json", "");
        fs.writeFile(Path.join("data/json", jsonName), result, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully saved " + jsonName);
            }
        })
        const parts = JSON.parse(result);
        const template = new TemplateDB({
            parts: parts,
            name: templateName,
            kind: req.body.kind,
            timestamp: req.body.timestamp as number
        });
        template.save().then(result => {
            res.status(201).json({
                message: "Template added successfully",
                postId: result._id
            });
        });
    }
}

export function createTemplate(req: any, res: Response) {
  const template  = new TemplateDB({
      parts: req.body.parts,
      name: req.body.name,
      kind: req.body.kind,
      timestamp: req.body.timestamp as number
  });
  template.save().then(result => {
    res.status(201).json({
      message: 'Template added successfully',
      postId: result._id
    });
  });
}

export function updateTemplate(req: Request, res: Response) {
  const newTemplate = new TemplateDB({
      _id: req.params.id,
      parts: req.body.parts,
      name: req.body.name,
      kind: req.body.kind,
      timestamp: req.body.timestamp
  });
  TemplateDB.updateOne({
      _id: req.params.id
    }, newTemplate)
    .then(result => {
      console.log(result);
      res.status(200).send("Update successful");
    });
}

export function deleteTemplate(req: any, res: Response){
    // find document by ID and delete
    TemplateDB.findByIdAndDelete({
        _id: req.params.id
    }).then(
        template => {
            if (template) {
                const jsonPath = "data/json/" + template.name + ".json";
                if (fs.existsSync(jsonPath)) {
                    fs.rmSync(jsonPath);
                    console.log(template.name + ": Json-file deleted");
                }
                console.log(template.name + ": Template entry deleted")
                res.status(200).send({message: template.name + " successfully deleted"});
            } else {
                res.status(500).send({message: "Template not found"});
            }
        });
}

export function getTemplateList(req: Request, res: Response){
  try {
    TemplateDB.find()
        .then(templates => {
          res.status(200).send(templates);
        });
  } catch {
    res.status(500);
  }
}

export async function getTemplateListAsString(req: Request, res: Response) {
    try {
        const templates = await TemplateDB.find({kind: req.body.kind}).exec();
        const templateNames: string[] = [];
        if (templates.length > 0) {
            for (const template of templates) {
                templateNames.push(template.name)
            }
        }
        res.status(200).send({templateNames});
    } catch (err) {
        res.status(500).send({message: err});
    }
}

export async function getTemplateById(req: Request, res: Response) {
    try {
        const template = await TemplateDB.findOne({_id: req.params.id}).exec();
        res.status(200).send(template);
    } catch (err) {
        res.status(500).send({message: err});
    }
}

export async function getTemplateByName(req: Request, res: Response) {
    try {
        const template = await TemplateDB.findOne({name: req.body.name}).exec();
        res.status(200).send({template});
    } catch (err) {
        res.status(500).send({message: err});
    }
}

export async function getTemplatesByKind(req: Request, res: Response) {
    try {
        const templates = await TemplateDB.find({kind: req.body.kind}).exec();
        res.status(200).send({templates});
    } catch (err) {
        res.status(500).send({message: err});
    }
}
