import mongoose from "mongoose";

declare const process: {
    env: Record<string, string | undefined>;
};

export const connectDB = async () => {
    try{
        console.log("Connecting to MongoDB...");
        const MONGODB_URL = process.env.MONGO_URI;
        if (!MONGODB_URL) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        await mongoose.connect(MONGODB_URL);
        console.log("MongoDB connected successfully");  
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
}