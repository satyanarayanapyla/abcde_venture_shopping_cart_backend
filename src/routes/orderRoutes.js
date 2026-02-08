import express from "express";
import { placeOrder, getOrders } from "../controllers/orderController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/place", verifyToken, placeOrder);
router.get("/get/orders", verifyToken, getOrders);

export default router;
