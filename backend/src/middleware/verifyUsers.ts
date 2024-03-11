import * as bcrypt from "bcrypt";
import {NextFunction, Request, Response} from "express";
import {Role, UserDB} from "../models";

export async function verifyPassword(req: any,
                                     res: Response,
                                     next: NextFunction): Promise<any> {
    try {
        const user = await UserDB.findById(req.params.id).exec();

        if (!user) {
            return res.status(404).send({ message: "Benutzer nicht gefunden!" });
        }

        const passwordIsValid = bcrypt.compareSync(req.body.password, user.password);

        if (!passwordIsValid) {
            return res.status(400).send({ message: "Falsches Passwort!" });
        }

        next();
    } catch (err) {
        res.status(500).send({ message: err || "Internal Server Error" });
    }
}

export function verifyRoleExists(req: Request, res: Response, next: NextFunction): void {
    if (req.body.role) {
        if (!Object.values(Role).includes(req.body.role)) {
            res.status(400).send({
                message: `Fehler! Die Rolle ${req.body.role} existiert nicht!`
            });
            return;
        }
    }
    next();
}

export async function verifyDuplicateUsername(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
        const user = await UserDB.findOne({ username: req.body.username }).exec();
        if (user) {
            res.status(400).send({ message: "Nutzername ist bereits vergeben." });
        } else {
            next();
        }
    } catch (err) {
        res.status(500).send({ message: err || "Internal Server Error" });
    }
}
