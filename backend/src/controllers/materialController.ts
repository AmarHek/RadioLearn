import Material from '../models/materialSchema';
import fs from 'fs';
import { Document } from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import * as path from "path";

/*
export interface matRequest extends Request {
    files: {
        mainScan: Express.Multer.File
    }
}*/

// TODO: Define request types properly

export function addMaterial (req: any, res: Response, next: NextFunction) {
    try {
        if (req.files) {
            const material = new Material({
                scans: {
                    id: req.body.id,
                    mainScan: req.files.mainScan[0].mimetype,
                    lateralScan: (req.files.lateralScan !== undefined) ? req.files.lateralScan[0].mimetype : "None",
                    preScan: (req.files.preScan !== undefined) ? req.files.preScan[0].mimetype : "None"
                },
                modality: req.body.modality,
                parts: JSON.parse(req.body.parts),
                judged: false
            });
            material.save().then((mat: Document) => {
                console.log("Material with id " + mat._id + " added successfully");
                res.status(201).json({
                    message: 'Material added successfully'
                });
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
          message: "Unexpected behaviour"
        })
    }
}

export function deleteMaterial(req: any, res: Response, next: NextFunction) {
    try {
        Material.deleteOne({
            _id: req.params.id
        }).then(
            result => {
                console.log(result);
                res.status(200).json({
                    message: "Material deleted"
                });
            });
    } catch (error) {
        res.status(404).json({
            message: "ID not found, could not delete",
            error: error
        })
    }
}

export function sampleMaterial(req: any, res: Response, next: NextFunction) {
  Material.find()
    .then(materials => {
      console.log(materials);
      res.status(200).json({
        message: "Materials fetched",
        materials: materials
      });
    });
}

export function queryMaterial(req: any, res: Response, next: NextFunction){
    Material.find(req.query).then(mats => {
        const materials = [];
        console.log(mats);
        for (const mat of mats) {
            const id = mat.scans.id;
            const mainScan = fs.readFileSync('data/images/' + id + '/mainScan.jpeg', 'base64');
            console.log(mainScan);
        }
    });
}

function readScans(scans: any) {

}

function readImage(path: any, mimetype: any) {

}
