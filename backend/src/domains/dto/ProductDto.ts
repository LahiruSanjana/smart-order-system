import { z } from "zod";

export const CreateProductDto = z.object({
    name: z.string().min(1, "Product name is required"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be a positive number"),
    stock: z.number().min(0, "Stock must be a non-negative number"),
    category: z.string().optional(),
    imageUrl: z.string().url("Invalid URL format").optional(),
    branchId: z.string().min(1, "Branch ID is required"),
});

export const UpdateProductDto = z.object({
    name: z.string().min(1, "Product name is required").optional(),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be a positive number").optional(),
    stock: z.number().min(0, "Stock must be a non-negative number").optional(),
    category: z.string().optional(),
    imageUrl: z.string().url("Invalid URL format").optional(),
});

