import * as jwt from "jsonwebtoken";
import { authConfig } from "../config";
import { UserDB, Role } from "../models";
import { Response, NextFunction} from "express";
import {JwtPayload} from "jsonwebtoken";

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers["authorization"] as string;

    if (!token) {
        return res.status(403).send({ message: "Kein Token gefunden!" });
    }

    jwt.verify(token, authConfig.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Nicht autorisiert!" });
        }
        if(decoded !== undefined) {
            req.userId = (decoded as JwtPayload).id;
        }
        next();
    });
};

export const isAdmin = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = await UserDB.findById(req.userId).exec();
        if (user) {
            if (user.role === Role.Admin) {
                next();
            } else {
                res.status(403).send({message: "Admin-Berechtigungen erforderlich!"});
            }
        } else {
            res.status(404).send({message: "Nutzer nicht gefunden!"});
        }
    } catch (err) {
        res.status(500).send({ message: err || "Internal Server Error" });
    }
}

export const isModerator = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = await UserDB.findById(req.userID).exec();
        if (user) {
            if (user.role === Role.Moderator || user.role === Role.Admin) {
                next();
            } else {
                res.status(403).send({message: "Mod-Berechtigungen erforderlich!"});
            }

        }
    } catch (err) {
        res.status(500).send({ message: err || "Internal Server Error" });
    }
}


