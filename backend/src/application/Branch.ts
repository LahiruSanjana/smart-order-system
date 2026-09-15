import {Request, Response, NextFunction} from "express";
import { z } from "zod";
import { CreateBranchDto, UpdateBranchDto, getBranchByIdDto } from "../domains/dto/BranchDto";
import { Branch } from "../infrastructure/entities/Branch";

export const getAllBranches = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const branches = await Branch.find({});
        res.status(200).json(branches);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const getBranchById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = getBranchByIdDto.parse(req.params);
        const branchId = validatedData.branchId;
        const branch = await Branch.findById(branchId);
        if (!branch) {
            return res.status(404).json({message: "Branch not found"});
        }
        res.status(200).json(branch);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const createBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = CreateBranchDto.parse(req.body);

        const newBranch = {
            name: validatedData.name,
            code: validatedData.code,
            address: validatedData.address,
            location: validatedData.location,
        }
        const branch = await Branch.create(newBranch);
        res.status(201).json(branch);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const updateBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const branchId = req.params.id;
        const validatedData = UpdateBranchDto.parse(req.body);
        const branch = await Branch.findById(branchId);
        if (!branch) {
            return res.status(404).json({message: "Branch not found"});
        }

        let updatedBranch = await Branch.findByIdAndUpdate(branchId, validatedData, { new: true, runValidators: true });
        res.status(200).json(updatedBranch);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const deleteBranch = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const branchId = req.params.id;
        const branch = await Branch.findById(branchId);
        if (!branch) {
            return res.status(404).json({message: "Branch not found"});
        }
        await Branch.findByIdAndDelete(branchId);
        res.status(200).json({message: "Branch deleted successfully"});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}