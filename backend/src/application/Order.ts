import {Request, Response, NextFunction} from "express";
import { OrderItems } from "../infrastructure/entities/Order";
import { Branch } from "../infrastructure/entities/Branch";
import { allocateBestBranch } from "./OrderAllocator";
import { z } from "zod";
import { CreateOrderDto, UpdateOrderDto } from "../domains/dto/OrderDto";
import {User} from "../infrastructure/entities/User";
import mongoose from "mongoose";

export const getAllOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orders = await OrderItems.find({});
        res.status(200).json(orders);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const getOrderById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id;
        const order = await OrderItems.findById(orderId);
        if (!order) {
            return res.status(404).json({message: "Order not found"});
        }
        res.status(200).json(order);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = CreateOrderDto.parse(req.body);

        // Check if the customer exists
        const customer = await User.findById(validatedData.customerId);
        if (!customer) {
            return res.status(404).json({message: "Customer not found"});
        }

        if (!customer.location) {
            return res.status(400).json({message: "Customer location is not set"});
        }

        // Allocate the best branch for the order
        const bestBranch = await allocateBestBranch(
            validatedData.items,
            validatedData.deliveryLocation ?? customer.location
        );

        if (!bestBranch || bestBranch.length === 0) {
            return res.status(400).json({message: "No eligible branches found for the given order items and customer location."});
        }

        const assignedBranch = bestBranch[0].branch;

        const session = await mongoose.startSession();
        let order;
        try {
            await session.withTransaction(async () => {
                for (const item of validatedData.items) {
            const updateResult = await Branch.updateOne({
                _id: assignedBranch._id,
                stock: { $elemMatch: { productId: item.productId, quantity: { $gte: item.quantity } } }
            }, {
                $inc: {"stock.$.quantity": -item.quantity}
            }, { session });

                    if (updateResult.modifiedCount !== 1) {
                        throw new Error(`Insufficient stock for product ${item.productId}`);
                    }
                }

                const workloadUpdate = await Branch.updateOne(
                    { _id: assignedBranch._id, currentWorkload: { $lt: assignedBranch.maxCapacity } },
                    { $inc: { currentWorkload: 1 } },
                    { session }
                );

                if (workloadUpdate.modifiedCount !== 1) {
                    throw new Error("The selected branch is no longer available");
                }

                const totalAmount = validatedData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
                [order] = await OrderItems.create([{
                    customerId: validatedData.customerId,
                    items: validatedData.items,
                    deliveryAddress: validatedData.deliveryAddress,
                    deliveryLocation: validatedData.deliveryLocation,
                    totalAmount,
                    assignedBranchId: assignedBranch._id,
                    status: "PENDING",
                }], { session });
            });
        } finally {
            await session.endSession();
        }

        res.status(201).json(order);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        if (error instanceof Error && (
            error.message.startsWith("Insufficient stock") ||
            error.message.includes("branch is no longer") ||
            error.message.startsWith("No eligible branches")
        )) {
            return res.status(400).json({message: error.message});
        }
        next(error);
    }
}

export const updateOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id;
        const validatedData = UpdateOrderDto.parse(req.body);
        const order = await OrderItems.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status !== "PENDING") {
            return res.status(400).json({ message: "Only pending orders can be updated" });
        }

        const session = await mongoose.startSession();
        let updatedOrder;
        try {
            await session.withTransaction(async () => {
                if (validatedData.items) {
                    if (!order.assignedBranchId) {
                        throw new Error("Order has no assigned branch");
                    }

                    const oldQuantities = new Map<string, number>();
                    const newQuantities = new Map<string, number>();
                    for (const item of order.items) {
                        const key = item.productId.toString();
                        oldQuantities.set(key, (oldQuantities.get(key) ?? 0) + item.quantity);
                    }
                    for (const item of validatedData.items) {
                        const key = item.productId.toString();
                        newQuantities.set(key, (newQuantities.get(key) ?? 0) + item.quantity);
                    }

                    const productIds = new Set([...oldQuantities.keys(), ...newQuantities.keys()]);
                    for (const productId of productIds) {
                        const delta = (newQuantities.get(productId) ?? 0) - (oldQuantities.get(productId) ?? 0);
                        if (delta > 0) {
                            const result = await Branch.updateOne(
                                { _id: order.assignedBranchId, stock: { $elemMatch: { productId, quantity: { $gte: delta } } } },
                                { $inc: { "stock.$.quantity": -delta } },
                                { session }
                            );
                            if (result.modifiedCount !== 1) {
                                throw new Error(`Insufficient stock for product ${productId}`);
                            }
                        } else if (delta < 0) {
                            await Branch.updateOne(
                                { _id: order.assignedBranchId, "stock.productId": productId },
                                { $inc: { "stock.$.quantity": -delta } },
                                { session }
                            );
                        }
                    }
                }

                const updateData: Record<string, unknown> = { ...validatedData };
                if (validatedData.items) {
                    updateData.totalAmount = validatedData.items.reduce(
                        (sum, item) => sum + item.price * item.quantity,
                        0
                    );
                }
                updatedOrder = await OrderItems.findByIdAndUpdate(orderId, updateData, {
                    new: true,
                    runValidators: true,
                    session,
                });
            });
        } finally {
            await session.endSession();
        }

        res.status(200).json(updatedOrder);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ message: error.issues.map(issue => issue.message).join(", ") });
        }
        if (error instanceof Error && (error.message.startsWith("Insufficient stock") || error.message.includes("no assigned"))) {
            return res.status(400).json({ message: error.message });
        }
        next(error);
    }
};

export const deleteOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orderId = req.params.id;
        const order = await OrderItems.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        if (order.status !== "PENDING") {
            return res.status(400).json({ message: "Only pending orders can be deleted" });
        }

        const session = await mongoose.startSession();
        try {
            await session.withTransaction(async () => {
                if (order.assignedBranchId) {
                    for (const item of order.items) {
                        await Branch.updateOne(
                            { _id: order.assignedBranchId, "stock.productId": item.productId },
                            { $inc: { "stock.$.quantity": item.quantity } },
                            { session }
                        );
                    }
                    await Branch.updateOne(
                        { _id: order.assignedBranchId, currentWorkload: { $gt: 0 } },
                        { $inc: { currentWorkload: -1 } },
                        { session }
                    );
                }
                await OrderItems.deleteOne({ _id: orderId }, { session });
            });
        } finally {
            await session.endSession();
        }

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        next(error);
    }
};