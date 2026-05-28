import { Router } from "express";
import { router as productsRoutes } from "./product.route.js";
import { router as cartRoutes } from "./cart.route.js";
import { router as orderRoutes } from "./order.route.js";

export const router = Router();

router.use("/products", productsRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
