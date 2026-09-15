import express from "express";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../application/Product";
import authenticationMiddleware from "./middlware/authenticationMiddlware";
import authorizationMiddleware from "./middlware/authorizationMiddlware";

const productRouter = express.Router();

productRouter.route("/").get(getAllProducts);
productRouter.route("/:id").get(getProductById);
productRouter.route("/").post(authenticationMiddleware, authorizationMiddleware("ADMIN", "SUPER_ADMIN"), createProduct);
productRouter.route("/:id").put(authenticationMiddleware, authorizationMiddleware("ADMIN", "SUPER_ADMIN"), updateProduct);
productRouter.route("/:id").delete(authenticationMiddleware, authorizationMiddleware("ADMIN", "SUPER_ADMIN"), deleteProduct);

export default productRouter;