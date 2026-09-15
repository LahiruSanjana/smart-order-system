import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    address: string;
    location?: {
        lat: number;
        lng: number;
    };
    phone?: string;
    role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
}

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true,lowercase: true,trim: true },
    password: { type: String, required: true },
    address: { type: String, required: true },
    location:{
        lat: { type: Number, required: false },
        lng: { type: Number, required: false },
    },
    phone: { type: String, required: false },
    role: { type: String, required: true, enum: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'], default: 'CUSTOMER' },
}, { timestamps: true });

export const User = mongoose.model<IUser>('User', userSchema);