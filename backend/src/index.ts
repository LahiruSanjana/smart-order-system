import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./infrastructure/db";

dotenv.config();

const server = express();

server.use(cors());
server.use(express.json());

server.get('/', (req, res) => {
    res.status(200).send('Smart Order Allocation System Backend (TypeScript) is Running...');
});

connectDB();

const PORT = process.env.PORT;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

