import express from "express";
import { getAllBranches, getBranchById, createBranch, updateBranch, deleteBranch } from "../application/Branch";
import authenticationMiddleware from "./middlware/authenticationMiddlware";
import authorizationMiddleware from "./middlware/authorizationMiddlware";

const branchRouter = express.Router();

branchRouter.route("/").get(getAllBranches);
branchRouter.route("/:id").get(getBranchById);
branchRouter.route("/").post(authenticationMiddleware, authorizationMiddleware("ADMIN", "SUPER_ADMIN"), createBranch);
branchRouter.route("/:id").put(authenticationMiddleware, authorizationMiddleware("ADMIN", "SUPER_ADMIN"), updateBranch);
branchRouter.route("/:id").delete(authenticationMiddleware, authorizationMiddleware("ADMIN", "SUPER_ADMIN"), deleteBranch);

export default branchRouter;