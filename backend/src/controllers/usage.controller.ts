import {Response} from "express";
import {RadiolearnData} from "../models/material.model";
import {ParticipantDB} from "../models";


export async function saveRadiolearnData(req: any, res: Response): Promise<void> {
    try {
        console.log("----------------------received material id: " + req.body.materialID);
        const usageData: RadiolearnData = {
            materialID: req.body.materialID,
            template: req.body.template,
            ogTemplate: req.body.ogTemplate,
            mode: req.body.mode,
            timestamp: req.body.timestamp,
            duration: req.body.duration,
            resetCounter: req.body.resetCounter,
            boxes: req.body.boxes
        };

        // Find participant by UUID
        const participant = await ParticipantDB.findOne({ UUID: req.body.UUID }).exec();

        if (!participant) {
            console.log("No matching participant found, creating entry:");
            const usageList: RadiolearnData[] = [usageData];
            const newParticipant = new ParticipantDB({
                UUID: req.body.UUID,
                usageList: usageList
            });
            await newParticipant.save();
            console.log("Successfully saved new participant.");
            res.status(200).send({ success: true, message: "Successfully saved new participant." });
        } else {
            participant.usageList.push(usageData);
            await participant.save();
            console.log("Successfully updated participant's usage data.");
            res.status(200).send({ success: true, message: "Successfully updated participant's usage data." });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
}

