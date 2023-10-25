import {Response} from "express";
import {RadiolearnData} from "../models/material.model";
import {ParticipantDB} from "../models";

function handleError(err: NativeError){
    console.log("Error querying for participant: " + err.message)
}

export function saveRadiolearnData(req: any, res: Response) {

    console.log("----------------------received material id: " + req.body.materialID)
    const usageData: RadiolearnData = {
        materialID: req.body.materialID,
        template: req.body.template,
        ogTemplate: req.body.ogTemplate,
        mode: req.body.mode,
        timestamp: req.body.timestamp,
        duration: req.body.duration,
        resetCounter: req.body.resetCounter,
        boxes: req.body.boxes
    }

    const query = ParticipantDB.findOne({'UUID': req.body.UUID});
    query.exec(function (err, participant){
        if (err) {
            return handleError(err);
        }
        if (participant == null) {
            console.log("No matching participant found, creating entry:")
            const usageList: RadiolearnData[] = []
            usageList.push(usageData)
            const participant = new ParticipantDB({
                UUID: req.body.UUID,
                usageList: usageList
            });
            participant.save(function (err){
                if (err){
                    console.log("Saving participant failed: " + err.message)
                    res.status(500).send({success: false,
                        message: "Saving participant failed: " + err.message})
                } else {
                    console.log("Successfully saved new participant.")
                    res.status(200).send({success: true, message: "Successfully saved new participant."})
                }
            })
        } else {
            participant.usageList.push(usageData)
            participant.save(function (err){
                if(err){
                    console.log("Updating participant failed: " + err.message)
                    res.status(500).send({success: false,
                        message: "Updating participant failed: " + err.message})
                }else {
                    console.log("Successfully updated participants usage data")
                    res.status(200).send({success: true,
                        message: "Successfully updated participants usage data"})
                }
            })
        }
    });
}