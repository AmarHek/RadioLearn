import {FeedbackDB} from "../models";
import {Request, Response} from "express";

export function addFeedback(req: Request, res: Response) {
    const newFeedback = new FeedbackDB({
        userID: req.body.userID,
        materialID: req.body.materialID,
        comment: req.body.comment,
        date: new Date()
    });
    newFeedback.save().then(result => {
        res.status(201).send({
            message: "Kommentar wurde gespeichert, vielen Dank!",
            postId: result._id
        });
    });
}

export async function getFeedbackCount(req: Request, res: Response): Promise<void> {
    try{
        const count = await FeedbackDB.countDocuments();
        console.log(count);
        res.status(201).send({count});
    }
    catch(err) {
        console.log(err);
        res.status(500).send({message: err});
    }
}

export async function getFeedbackList(req: Request, res: Response) {
    try {
        const feedbackList= await FeedbackDB.find()
            .skip(req.body.skip)
            .limit(req.body.length)
            .exec();
        res.status(200).send({feedbackList});
    }
    catch(err) {
        res.status(404).send({message: err});
    }
}

export async function deleteFeedback(req: Request, res: Response) {
    try {
        await FeedbackDB.deleteOne({_id: req.params.id});
        res.status(200).send({message: "Comment deleted."});
    }
    catch(err) {
        res.status(500).send({message: err});
    }
}
