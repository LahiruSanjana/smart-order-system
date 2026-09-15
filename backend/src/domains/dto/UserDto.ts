import {z} from "zod";

export const SignUpDto = z.object({
    firstName: z.string().min(1, "User first name is required"),
    lastName: z.string().min(1, "User last name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']).optional(),
    address: z.string().optional(),
    location: z.object({
        lat: z.number().optional(),
        lng: z.number().optional(),
    }).optional(),
    phone: z.string().optional(),
});

export const UpdateUserDataDto = z.object({
    firstName: z.string().min(1, "User first name is required").optional(),
    lastName: z.string().min(1, "User last name is required").optional(),
    email: z.string().email("Invalid email format").optional(),
    password: z.string().min(6, "Password must be at least 6 characters long").optional(),
    role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN']).optional(),
    address: z.string().optional(),
    location: z.object({
        lat: z.number().optional(),
        lng: z.number().optional(),
    }).optional(),
    phone: z.string().optional(),
});

export const LoginDto = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
});
