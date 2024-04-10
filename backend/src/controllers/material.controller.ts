import {updatePartsBackwardsCompatible} from "../middleware/materialMiddleware";
import {MaterialDB, ParticipantDB, TemplateDB} from '../models';
import {Document} from 'mongoose';
import {Request, Response} from 'express';
import fs from "fs";
import Path from "path";
import {Template} from "../models/template.model";
import {isJsonString} from "../util/util";
import {dataPathConfig} from "../config";

// TODO: Define request types properly

export function filename(originalname: string, suffix: string): string {
    const nameSplit = originalname.split(".");
    return nameSplit[0] + "_" + suffix + "." + nameSplit[1] as string;
}

export function addMaterial(req: any, res: Response): void {
    if (req.files) {
        if (!isJsonString(req.body.deepDocTemplate) || !isJsonString(req.body.shallowDocTemplate)) {
            res.status(500).send({message: "One or more templates are invalid and cannot be parsed"});
        }

        const mainScan = {
            filename: filename(req.files.mainScan[0].originalname, req.files.mainScan[0].fieldname),
            mimetype: req.files.mainScan[0].mimetype
        };
        let lateralScan = undefined;
        if (req.files.lateralScan !== undefined) {
            lateralScan = {
                filename: filename(req.files.lateralScan[0].originalname, req.files.lateralScan[0].fieldname),
                mimetype: req.files.lateralScan[0].mimetype
            }
        }
        let preScan = undefined;
        if (req.files.preScan !== undefined) {
            preScan = {
                filename: filename(req.files.preScan[0].originalname, req.files.preScan[0].fieldname),
                mimetype: req.files.preScan[0].mimetype
            }
        }

        const time: number = new Date().getTime();

        const material = new MaterialDB({
            scans: {
                id: req.body.id,
                mainScan: mainScan,
                lateralScan: lateralScan,
                preScan: preScan
            },
            annotations: {
                main: [],
                lateral: [],
                pre: []
            },
            modality: req.body.modality,
            deepDocTemplate: JSON.parse(req.body.deepDocTemplate),
            shallowDocTemplate: JSON.parse(req.body.shallowDocTemplate),
            pathologies: [],
            timestamp: time,
            judged: false
        });

        material.save().then((mat: Document) => {
            const message = "Material with id " + mat._id + " added successfully";
            res.status(201).json({
                success: true,
                message: message
            });
        });
    } else {
        res.status(500).send({message: "No files in request found."})
    }
}

export async function deleteMaterial(req: Request, res: Response): Promise<void> {
    try {
        await MaterialDB.deleteOne({_id: req.body.objectID})
        const dir = Path.join(dataPathConfig.path, "images", req.body.scanID);
        fs.rmSync(dir, {recursive: true});
        res.status(200).send({message: "Material deleted"});
    }
    catch(err) {
        res.status(500).send({message: err});
    }
}

export async function updateMaterial(req: Request, res: Response): Promise<void> {
    try {
        const time: number = new Date().getTime();
        const response = await MaterialDB.updateOne({
            _id: req.params.id
        }, {
            deepDocTemplate: req.body.deepDocTemplate,
            shallowDocTemplate: req.body.shallowDocTemplate,
            annotations: req.body.annotations,
            pathologies: req.body.pathologies,
            lastModified: time,
            judged: req.body.judged
        }).exec();
        console.log(response);
        if (response.modifiedCount === 1) {
            res.status(200).json({message: "Update successful"});
        } else {
            res.status(200).json({message: "No changes detected."});
        }
    }
    catch(err) {
        res.status(500).send({message: err});
    }
}

export async function addScan(req: any, res: Response) {
    try {
        const newScan = {
            filename: req.file.filename,
            mimetype: req.file.mimetype
        }

        const material = await MaterialDB.findById(req.params.id).exec();
        if (!material) {
            return res.status(404).send({message: "Material not found"});
        } else {

            const scans = { ...material.scans };

            if (req.body.scanType === "lateralScan") {
                scans.lateralScan = newScan;
            } else if (req.body.scanType === "preScan") {
                scans.preScan = newScan;
            }

            const response = await MaterialDB.updateOne({_id: req.params.id}, {
                scans: scans
            }).exec();
            console.log(response);

            res.status(200).send({message: "Update successful"});
        }
    } catch(err) {
        console.log(err)
        res.status(500).send({message: err});
    }
}

export async function deleteScanById(req: Request, res: Response) {
    try {
        let update;
        if (req.body.scanType === "lateralScan") {
            update = {
                "scans.lateralScan": undefined,
                "annotations.lateral": []
            }
        } else if (req.body.scanType === "preScan") {
            update = {
                "scans.preScan": undefined,
                "annotations.pre": []
            }
        } else {
            res.status(400).send({message: "Unknown scanType specified"});
            return;
        }

        const updateResult = await MaterialDB.updateOne({_id: req.params.id}, update).exec();
        console.log(updateResult);

        if (updateResult.modifiedCount === 0) {
            res.status(404).send(
                {message: "No scan was deleted. Material not found or scan already deleted."});
        }

        // delete image from server folder
        const imagePath = Path.join(dataPathConfig.path, "images", req.body.id, req.body.filename);
        if (fs.existsSync(imagePath)) {
            fs.rmSync(imagePath);
        }
        res.status(200).send({message: "Deletion successful"});
    } catch(err) {
        res.status(500).send({message: err});
    }
}

export async function updateMaterialTemplates(req: Request, res: Response): Promise<void> {
    try {
        // Find the current template
        const template = await TemplateDB.findOne({ name: "Radiolearn" }).exec();

        if (!template) {
            res.status(404).send({ message: "Template not found" });
            return;
        }

        // Create a new template object
        const newTemplate: Template = {
            _id: template._id,
            parts: template.parts,
            kind: template.kind,
            name: template.name,
            timestamp: template.timestamp
        };

        // Update materials where necessary
        const updateResult = await MaterialDB.updateMany({
            'judged': req.body.judged,
            'template.timestamp': { $lt: newTemplate.timestamp }
        }, {
            $set: {
                deepDocTemplate: newTemplate,
                judged: false
            }
        }).exec();

        console.log(updateResult);
        res.status(200).send({ message: "All updates successful" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err || "Internal Server Error" });
    }
}

// NOTE: BETTER USE PYTHON SCRIPTS WITH HARD CODED CHANGES
export async function updateMatTempBC(req: Request, res: Response): Promise<void> {
    try {
        // Find the current template
        const template = await TemplateDB.findOne({ name: "Radiolearn" }).exec();

        if (!template) {
            res.status(404).send({ message: "Template not found" });
            return;
        }

        // Find materials with old template and judged as true
        const materials = await MaterialDB.find({
            'judged': true,
            'template.timestamp': { $lt: template.timestamp }
        }).exec();

        if (materials.length === 0) {
            res.status(200).send({ message: "No materials to update." });
            return;
        }

        // Update materials
        for (const material of materials) {
            // Copy new template parts
            const newPartsEmpty = JSON.parse(JSON.stringify(template.parts));
            // Update new parts with old parts
            const newParts = updatePartsBackwardsCompatible(newPartsEmpty, material.deepDocTemplate.parts);
            // Generate new template
            const newTemplate = {
                _id: material.deepDocTemplate._id,
                name: template.name,
                timestamp: template.timestamp,
                parts: newParts
            };

            // Update material entry with new template
            await MaterialDB.updateOne({ _id: material._id }, { template: newTemplate }).exec();
        }

        res.status(200).send({ message: "Update successful" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err || "Internal Server Error" });
    }
}

export async function updateMaterialTemplateBCByID(req: Request, res: Response): Promise<void> {
    try {
        // Find the current template
        const template = await TemplateDB.findOne({ name: "Radiolearn" }).exec();

        if (!template) {
            res.status(404).send({ message: "Template not found" });
            return;
        }

        // Find material by ID
        const material = await MaterialDB.findById(req.params.id).exec();

        if (!material) {
            res.status(404).send({ message: "Material not found" });
            return;
        }

        // Copy new template parts
        const newPartsEmpty = JSON.parse(JSON.stringify(template.parts));
        // Update new parts with old parts
        const newParts = updatePartsBackwardsCompatible(newPartsEmpty, material.deepDocTemplate.parts);
        // Generate new template
        const newTemplate = {
            _id: material.deepDocTemplate._id,
            name: template.name,
            timestamp: template.timestamp,
            parts: newParts
        };

        // Update material entry with new template
        await MaterialDB.updateOne({ _id: material._id }, { template: newTemplate }).exec();

        res.status(200).send({ message: "Update successful" });
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: err || "Internal Server Error" });
    }
}

export async function getMaterialById(req: Request, res: Response): Promise<void> {
    try {
        const material = await MaterialDB.findById(req.params.id).exec();

        if (!material) {
            res.status(404).send({message: "Material not found"});
            return;
        }

        res.status(200).send({material});
    } catch (err) {
        console.error(err);
        res.status(500).send({message: err || "Internal Server Error"});
    }
}

export async function listAll(req: Request, res: Response): Promise<void> {
    try {
        const materials = await MaterialDB.find().exec();
        res.status(200).send({materials});
    } catch(err) {
        console.log(err);
        res.status(500).send({message: err});
    }
}

export async function listByFilter(req: Request, res: Response): Promise<void> {
    try {
        let filter;
        if (req.body.shallowDocTemplate !== undefined) {
            filter = {
                'judged': req.body.judged,
                'shallowDocTemplate.name': req.body.shallowDocTemplate
            }
        } else {
            filter = {
                'judged': req.body.judged
            }
        }
        console.log(req.body);
        console.log("Filter: ", filter);

        const skip = Math.max(0, req.body.skip);
        if (req.body.judged) {
            const materials = await MaterialDB.find(filter)
                .sort('lastModified')
                .skip(skip)
                .limit(req.body.length)
                .exec();
            res.status(200).send({materials});
        } else {
            const materials = await MaterialDB.find(filter)
                .skip(skip)
                .limit(req.body.length)
                .exec();
            res.status(200).send({materials});
        }
    } catch(err) {
        res.status(404).send({message: err});
    }
}

export async function getRandom(req: Request, res: Response): Promise<void> {
    try {
        const count = await MaterialDB.countDocuments({judged: req.body.judged}).exec();
        const random = Math.floor(Math.random() * count);
        const randomMaterial = await MaterialDB.findOne({judged: req.body.judged}).skip(random).exec();
        res.status(200).send({material: randomMaterial});
    } catch (error) {
        res.status(500).send({message: error})
    }
}

/*
* Returns a material that the participant with the UUID specified in the request body has not completed yet,
* or the error "no-unused-materials" if no unused materials are left for this participant.
* */
export async function getUnusedMaterial(req: Request, res: Response): Promise<void> {
    console.log('received request to give unused material');

    try {
        const participant = await ParticipantDB.findOne({'UUID': req.body.UUID}).exec();

        const usedMaterialIDs: string[] = participant?.usageList
            .filter(usageData => usageData.mode === req.body.mode && usageData.resetCounter === req.body.resetCounter)
            .map(usageData => usageData.materialID) || [];

        const materials = await MaterialDB.find({'judged': true}).exec();

        const unusedMaterialIDs: string[] = materials
            .filter(material => !usedMaterialIDs.includes(material._id.toString()))
            .map(material => material._id.toString());

        if (unusedMaterialIDs.length <= 0) {
            console.log('No unused materials left');
            res.status(200).send({material: null});
            return;
        }

        const randomUnusedMaterialID = unusedMaterialIDs[Math.floor(Math.random() * unusedMaterialIDs.length)];
        console.log('selected random id:', randomUnusedMaterialID);

        const material = await MaterialDB.findOne({'_id': randomUnusedMaterialID}).exec();
        res.status(200).send({material});
    } catch (error) {
        console.log('Error:', (error as Error).message);
        res.status(500).send({message: (error as Error).message});
    }
}

export async function countMaterials(req: Request, res: Response): Promise<void> {
    try {
        let filter;
        if (req.body.shallowDocTemplate !== undefined) {
            filter = {
                'judged': req.body.judged,
                'shallowDocTemplate.name': req.body.shallowDocTemplate
            }
        } else {
            filter = {
                'judged': req.body.judged
            }
        }

        console.log("Count", req.body);
        console.log("Count", filter);

        const count = await MaterialDB.countDocuments(filter).exec();

        res.status(200).send({count});
    } catch (err) {
        console.error(err);
        res.status(500).send({message: err || "Internal Server Error"});
    }
}
