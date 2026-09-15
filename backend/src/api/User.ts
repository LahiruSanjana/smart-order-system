import express from "express";
import {signUpUser, loginUser, getUserProfile, changeUserPassword, updateUserProfile, updateUserRole, deleteUser} from "../application/User";
import authenticationMiddleware from "./middlware/authenticationMiddlware";
import authorizationMiddleware from "./middlware/authorizationMiddlware"

const userRouter = express.Router();

userRouter.route("/signup").post(signUpUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/:id/role").put(authenticationMiddleware, authorizationMiddleware("SUPER_ADMIN"), updateUserRole);
userRouter.route("/:id").get(authenticationMiddleware, getUserProfile);
userRouter.route("/:id").put(authenticationMiddleware, updateUserProfile);
userRouter.route("/:id/password").put(authenticationMiddleware, changeUserPassword);
userRouter.route("/:id").delete(authenticationMiddleware, authorizationMiddleware("ADMIN", "SUPER_ADMIN"), deleteUser);

export default userRouter;
