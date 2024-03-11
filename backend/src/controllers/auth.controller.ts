import { authConfig } from "../config";
import { UserDB, Role } from "../models";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";
import { Request, Response } from "express";

export function signUp(req: Request, res: Response) {

    if (req.body !== null) {

        const user = new UserDB({
            username: req.body.username,
            password: bcrypt.hashSync(req.body.password, 8)
        });

        if (req.body.role) {
            if (Object.values(Role).includes(req.body.role)) {
                user.role = req.body.role;
            } else {
                res.status(500).send({ message: "Die Rolle existiert nicht!"});
                return;
            }
        } else {
            user.role = Role.User;
        }

        user.save().then(() => {
            res.send({ message: "Benutzer wurde erfolgreich registriert!" });
        })

    }
}

export async function signIn(req: Request, res: Response) {
    try {
        const user = await UserDB.findOne({ username: req.body.username }).exec();

        if (!user) {
            return res.status(404).send({ message: "Falscher Nutzername oder falsches Passwort!" });
        }

        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Falscher Nutzername oder falsches Passwort!"
            });
        }

        const token = jwt.sign({ id: user.id }, authConfig.secret, {
            expiresIn: 7 * 86400 // 7 days
        });

        res.status(200).send({
            id: user._id,
            username: user.username,
            role: user.role,
            accessToken: token
        });
    } catch (err) {
        res.status(500).send({ message: err || "Internal Server Error" });
    }
}
