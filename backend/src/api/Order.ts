import express from "express";
import { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder, getOrdersByCustomerId, getOredersByBranchId  } from "../application/Order";
import authenticationMiddleware from "./middlware/authenticationMiddlware";
import authorizationMiddleware from "./middlware/authorizationMiddlware";

const orderRouter = express.Router();

orderRouter.route("/customer/:customerId").get(authenticationMiddleware, getOrdersByCustomerId);
orderRouter.route("/branch/:branchId").get(authenticationMiddleware, authorizationMiddleware("ADMIN", "SUPER_ADMIN"), getOredersByBranchId);
orderRouter.route("/").get(authenticationMiddleware, authorizationMiddleware("ADMIN", "SUPER_ADMIN"), getAllOrders);
orderRouter.route("/:id").get(authenticationMiddleware, authorizationMiddleware("ADMIN", "SUPER_ADMIN"),getOrderById);
orderRouter.route("/").post(authenticationMiddleware, createOrder);
orderRouter.route("/:id").put(authenticationMiddleware, updateOrder);
orderRouter.route("/:id").delete(authenticationMiddleware, authorizationMiddleware("ADMIN", "SUPER_ADMIN"), deleteOrder);

export default orderRouter;