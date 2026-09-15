import mongoose from "mongoose";

export interface IBranchStock {
    productId: mongoose.Types.ObjectId;
    quantity: number;
}

export interface IBranch extends mongoose.Document {
    name: string;
    code: string;
    address: string;
    location?: {
        lat: number;
        lng: number;
    };
    stock: IBranchStock[];
    currentWorkload: number;
    maxCapacity: number;
    isActive: boolean;
}

const branchSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true },
    address: { type: String, required: true },
    location: {
        lat: { type: Number, required: false },
        lng: { type: Number, required: false },
    },
    stock: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 0 },
    }],
    currentWorkload: { type: Number, required: true, default: 0, min: 0 },
    maxCapacity: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, required: true, default: true },
}, { timestamps: true });

branchSchema.index({"location.lat": 1, "location.lng": 1});

export const Branch = mongoose.model<IBranch>('Branch', branchSchema);