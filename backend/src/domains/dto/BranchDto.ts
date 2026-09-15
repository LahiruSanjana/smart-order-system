import {z} from "zod";

export const CreateBranchDto = z.object({
    name: z.string().min(1, "Branch name is required"),
    address: z.string().min(1, "Branch address is required"),
    location: z.object({
        lat: z.number().optional(),
        lng: z.number().optional(),
    }).optional(),
});

export const UpdateBranchDto = z.object({
    name: z.string().min(1, "Branch name is required").optional(),
    address: z.string().min(1, "Branch address is required").optional(),
    location: z.object({    
        lat: z.number().optional(),
        lng: z.number().optional(),
    }).optional(),
});

export const getBranch = z.object({
    branchId: z.string().min(1, "Branch ID is required"),
});