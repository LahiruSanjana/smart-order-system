import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../domains/error/Errors";

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new UnauthorizedError("Authorization header is missing or invalid"));
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        return next(new UnauthorizedError("JWT secret is not defined"));
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        (req as Request & { user?: string | jwt.JwtPayload }).user = decoded;
        return next();
    } catch (error) {
        return next(new UnauthorizedError("Invalid or expired token"));
    }
}

export default authenticationMiddleware;