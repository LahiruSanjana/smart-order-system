import mongoose from "mongoose";

export interface IOrderItemSub {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IOrderItem extends mongoose.Document {
    customerId: mongoose.Types.ObjectId;
    items: IOrderItemSub[];
    totalAmount: number;
    deliveryAddress: string;
    deliveryLocation?: {
        lat: number;
        lng: number;
    };
    assignedBranchId?: mongoose.Types.ObjectId;
    status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}

const orderItemSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
    }],
    totalAmount: { type: Number, required: true, min: 0 },
    deliveryAddress: { type: String, required: true },
    deliveryLocation: {
        lat: { type: Number, required: false },
        lng: { type: Number, required: false },
    },
    assignedBranchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: false },
    status: { type: String, enum: ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], required: true },
}, { timestamps: true });

orderItemSchema.index({ customerId: 1, status: 1 });
orderItemSchema.index({ assignedBranchId: 1, status: 1 });

export const OrderItems = mongoose.model<IOrderItem>('OrderItem', orderItemSchema);