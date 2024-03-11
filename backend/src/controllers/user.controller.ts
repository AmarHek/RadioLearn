import {Request, Response} from "express";
import {UserDB} from "../models";
import * as bcrypt from "bcrypt";

export const getUsers = (req: Request, res: Response) => {
    try {
        UserDB.find().then(users => {
            const result = users.map((user) => {
                return {
                    id: user._id,
                    username: user.username,
                    role: user.role
                }
            })
            res.status(200).send(result);
        });
    } catch (error) {
        res.status(404);
    }
}

export const getUserById = (req: Request, res: Response) => {
    try {
        UserDB.find({_id: req.params.id}).then(users => {
            const user = users[0];
            res.status(200).send({
                id: user._id,
                username: user.username,
                role: user.role
            });
        });
    } catch(err) {
        res.status(500).send({message: err});
    }
}

export const deleteUserById = (req: Request, res: Response) => {
    try {
        UserDB.deleteOne({_id: req.params.id}).then(() => {
            res.status(200).send({message: "User erfolgreich gelöscht."});
        });
    } catch(err) {
        res.status(500).send({message: err});
    }
}

export const changeUsername = (req: Request, res: Response) => {
    try {
        UserDB.updateOne({
            _id: req.params.id
        }, {
            username: req.body.newUsername
        }).then(() => {
            res.status(200).send({message: "Username erfolgreich geändert."});
        });
    } catch(err) {
        res.status(500).send({message: err});
    }
}

export const changePassword = (req: Request, res: Response) => {
    try {
        const newPassword = bcrypt.hashSync(req.body.newPassword, 8);
        UserDB.updateOne({
            _id: req.params.id
        }, {
            password: newPassword
        }).then(() => {
            res.status(200).send({message: "Passwort erfolgreich geändert."});
        });
    } catch(err) {
        res.status(500).send({message: err});
    }
}

export const changeRole = (req: Request, res: Response) => {
    try {
        UserDB.updateOne({
            _id: req.params.id
        }, {
            role: req.body.newRole
        }).then(() => {
            res.status(200).send({message: "Rolle erfolgreich geändert."});
        });
    } catch(err) {
        res.status(500).send({message: err});
    }
}
