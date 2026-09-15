import { UnauthorizedError, ForbiddenError } from "../../domains/error/Errors";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

type UserRole = "ADMIN" | "SUPER_ADMIN"

type AuthenticatedRequest = Request & {
    user?: string | jwt.JwtPayload;
};

export const authorizationMiddleware = (...allowedRoles: UserRole[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || typeof req.user === "string") {
            return next(new UnauthorizedError("Authentication is required"));
        }

        const role = req.user.role;
        if (typeof role !== "string" || !allowedRoles.includes(role as UserRole)) {
            return next(new ForbiddenError("You do not have permission to access this resource"));
        }

        next();
    };
};

export default authorizationMiddleware;