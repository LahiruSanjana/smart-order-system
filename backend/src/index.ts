import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./infrastructure/db";
import branchRouter from "./api/Branch";
import orderRouter from "./api/Order";
import productRouter from "./api/Product";
import userRouter from "./api/User";
import loggerMiddleware from "./api/middlware/loggerMiddlware";
import globalErrorHandler from "./api/middlware/globalErrorHandlingMiddleware";
import { ensureSuperAdminExists } from "./application/User";

dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());
server.use(loggerMiddleware);

server.get('/', (req, res) => {
    res.status(200).send('Smart Order Allocation System Backend (TypeScript) is Running...');
});

server.use('/branches', branchRouter);
server.use('/orders', orderRouter);
server.use('/products', productRouter);
server.use('/users', userRouter);

server.use(globalErrorHandler);

connectDB()
    .then(async () => {
        await ensureSuperAdminExists();
        const PORT = process.env.PORT || 5000;
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error("Database connection failed:", error);
        process.exit(1);
    });

