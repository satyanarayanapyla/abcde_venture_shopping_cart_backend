import express from "express";
import { addToCart, getCartItems } from "../controllers/cartControllers.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/add/carts", verifyToken, addToCart);
router.get("/get/carts", verifyToken, getCartItems);

export default router;
