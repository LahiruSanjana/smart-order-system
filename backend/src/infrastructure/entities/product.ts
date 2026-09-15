import mongoose from "mongoose";

export interface IProduct extends mongoose.Document {
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    imageUrl?: string;
    sku?: string;
}

const productSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    imageUrl: { type: String, required: false },
    sku: { type: String, required: false,unique: true, trim: true,sparse: true },
}, { timestamps: true });

export const Product = mongoose.model<IProduct>('Product', productSchema);