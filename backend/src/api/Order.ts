import express from "express";
import { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder  } from "../application/Order";
import authenticationMiddleware from "./middlware/authenticationMiddlware";
import authorizationMiddleware from "./middlware/authorizationMiddlware";

const orderRouter = express.Router();

orderRouter.route("/").get(getAllOrders);
orderRouter.route("/:id").get(getOrderById);
orderRouter.route("/").post(authenticationMiddleware, createOrder);
orderRouter.route("/:id").put(authenticationMiddleware, updateOrder);
orderRouter.route("/:id").delete(authenticationMiddleware, authorizationMiddleware("ADMIN", "SUPER_ADMIN"), deleteOrder);

export default orderRouter;