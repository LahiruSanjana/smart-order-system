import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(mongoose.Types.ObjectId.isValid, "Invalid ID").transform(value => new mongoose.Types.ObjectId(value));
const location = z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
});
import { totalmem } from "node:os";

export const CreateOrderDto = z.object({
    customerId: objectId,
    items: z.array(z.object({
        productId: objectId,
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0, "Price must be a positive number"),
    })).min(1, "At least one item is required"),
    totalAmount: z.number().min(0, "Total amount must be a positive number"),
    deliveryAddress: z.string().min(1, "Delivery address is required"),
    deliveryLocation: location.optional(),
    assignedBranchId: z.string().optional(),
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
});

export const UpdateOrderDto = z.object({
    items: z.array(z.object({
        productId: objectId,
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0, "Price must be a positive number"),
    })).min(1, "At least one item is required").optional(),
    totalAmount: z.number().min(0, "Total amount must be a positive number").optional(),
    deliveryAddress: z.string().min(1, "Delivery address is required").optional(),
    deliveryLocation: location.optional(),
    assignedBranchId: z.string().optional(),
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
});