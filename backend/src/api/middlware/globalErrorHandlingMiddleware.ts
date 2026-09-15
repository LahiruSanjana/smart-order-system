import { Request, Response, NextFunction } from 'express'; 
const globalErrorHandler = (
    err: Error, 
    req: Request, 
    res: Response, 
    next: NextFunction) => {
    console.error(err.stack);
    if(err.name === "ValidationError"){
        return res.status(400).json({ message: err.message });
    }
    if(err.name === "NotFoundError"){
        return res.status(404).json({ message: err.message });
    }
    if(err.name === "UnauthorizedError"){
        return res.status(401).json({ message: err.message });
    }
    if(err.name === "ForbiddenError"){
        return res.status(403).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal Server Error" });
};
 
export default globalErrorHandler;