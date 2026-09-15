import jwt from "jsonwebtoken";
import {Request, Response, NextFunction} from "express";
import { User } from "../infrastructure/entities/User";
import {SignUpDto, UpdateUserDataDto, LoginDto} from "../domains/dto/UserDto";
import { z } from "zod";
import { NotFoundError } from "../domains/error/Errors";
import bcrypt from "bcrypt";

const SUPER_ADMIN_DEFAULT_EMAIL = process.env.SUPER_ADMIN_EMAIL || "superadmin@smartorder.com";
const SUPER_ADMIN_DEFAULT_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin123!";

export const generateToken = (id: string, role: string) => {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error("JWT_SECRET is not defined in the environment variables");
    }

    return jwt.sign({ id, role }, jwtSecret, {
        expiresIn: "1h",
    });
}

export const ensureSuperAdminExists = async () => {
    const existingUser = await User.findOne({ email: SUPER_ADMIN_DEFAULT_EMAIL.toLowerCase() });

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash(SUPER_ADMIN_DEFAULT_PASSWORD, 10);
        await User.create({
            firstName: "Super",
            lastName: "Admin",
            email: SUPER_ADMIN_DEFAULT_EMAIL.toLowerCase(),
            password: hashedPassword,
            role: "SUPER_ADMIN",
            address: "System bootstrap",
            phone: "0000000000",
        });
        return;
    }

    if (existingUser.role !== "SUPER_ADMIN") {
        existingUser.role = "SUPER_ADMIN";
        await existingUser.save();
    }
};

export const signUpUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const validatedData = SignUpDto.parse(req.body);

        const existinguser = await User.findOne({email: validatedData.email});
        if (existinguser) {
            return res.status(400).json({message: "User with this email already exists"});
        }

        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        const user = await User.create({
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.email,
            password: hashedPassword,
            role: validatedData.role ?? 'CUSTOMER',
            address: validatedData.address ?? "",
            location: validatedData.location,
            phone: validatedData.phone,
        });

        res.status(201).json({
            user:{
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                address: user.address,
                location: user.location,
                phone: user.phone,
            }
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email, password} = LoginDto.parse(req.body);

        if (!email || !password) {
            return res.status(400).json({message: "Email and password are required"});
        }

        const user = await User.findOne({email});
        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({message: "Invalid password"});
        }

        const token = generateToken(user.id.toString(), user.role);
        res.status(200).json({
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                address: user.address,
                location: user.location,
                phone: user.phone,
            },
            token
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        res.status(200).json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            address: user.address,
            location: user.location,
            phone: user.phone,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const updateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        const validatedData = UpdateUserDataDto.parse(req.body);

        const user = await User.findByIdAndUpdate(userId, validatedData, {new: true});
        if (!user) {
            throw new NotFoundError("User not found");
        }
        res.status(200).json({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            address: user.address,
            location: user.location,
            phone: user.phone,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        const { role } = z.object({
            role: z.enum(['CUSTOMER', 'ADMIN', 'SUPER_ADMIN'])
        }).parse(req.body);

        const user = await User.findByIdAndUpdate(userId, { role }, { new: true });
        if (!user) {
            throw new NotFoundError("User not found");
        }

        res.status(200).json({
            id: user.id,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
};

export const changeUserPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            return res.status(401).json({message: "Old password is incorrect"});
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();
        res.status(200).json({message: "Password changed successfully"});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }
}

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            throw new NotFoundError("User not found");
        }
        res.status(200).json({message: "User deleted successfully"});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({message: error.issues.map(e => e.message).join(", ")});
        }
        next(error);
    }   
}