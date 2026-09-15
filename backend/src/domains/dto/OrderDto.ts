import { z } from "zod";

export const CreateOrderDto = z.object({
    userId: z.string().min(1, "User ID is required"),
    items: z.array(z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0, "Price must be a positive number"),
    })).min(1, "At least one item is required"),
    deliveryAddress: z.string().min(1, "Delivery address is required"),
    deliveryLocation: z.object({
        lat: z.number().min(1, "Latitude is required"),
        lng: z.number().min(1, "Longitude is required"),
    }).optional(),
    assignedBranchId: z.string().optional(),
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
});

export const UpdateOrderDto = z.object({
    items: z.array(z.object({
        productId: z.string().min(1, "Product ID is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0, "Price must be a positive number"),
    })).min(1, "At least one item is required").optional(),
    deliveryAddress: z.string().min(1, "Delivery address is required").optional(),
    deliveryLocation: z.object({
        lat: z.number().min(1, "Latitude is required"),
        lng: z.number().min(1, "Longitude is required"),
    }).optional(),
    assignedBranchId: z.string().optional(),
    status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
});