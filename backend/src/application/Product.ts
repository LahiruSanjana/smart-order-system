import {Request, Response, NextFunction} from "express";
import { z } from "zod";
import { CreateProductDto, UpdateProductDto } from "../domains/dto/ProductDto";
import { Product } from "../infrastructure/entities/Product";

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({message: "Product not found"});
        }
        res.status(200).json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = CreateProductDto.parse(req.body);

        const newProduct = {
            name: validatedData.name,
            description: validatedData.description,
            price: validatedData.price,
            stock: validatedData.stock,
            category: validatedData.category,
            imageUrl: validatedData.imageUrl,
        }

        const product = await Product.create(newProduct);
        res.status(201).json(product);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = req.params.id;
        const validatedData = UpdateProductDto.parse(req.body);
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({message: "Product not found"});
        }

        let updatedProduct = await Product.findByIdAndUpdate(productId, validatedData, { new: true, runValidators: true });
        res.status(200).json(updatedProduct);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({message: "Product not found"});
        }
        await Product.findByIdAndDelete(productId);
        res.status(200).json({message: "Product deleted successfully"});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}