import express from 'express';
import { createAuthMiddleware } from '../middlewares/auth.middleware.js';
import { cancelOrder, createOrder, getAllUserOrders, getOrderById, updateOrderAddress } from '../controllers/order.controller.js';
import { orderIdValidation, updateOrderAddressValidation } from '../middlewares/validation.middleware.js';



const router = express.Router();

router.post("/", createAuthMiddleware(["user","seller"]),createOrder);
router.get("/me", createAuthMiddleware(["user","seller"]), getAllUserOrders);
router.get("/:orderId", createAuthMiddleware(["user","seller"]), orderIdValidation, getOrderById);
router.post("/:orderId/cancel", createAuthMiddleware(["user","seller"]), orderIdValidation, cancelOrder);
router.post("/:orderId/address", createAuthMiddleware(["user","seller"]), updateOrderAddressValidation, updateOrderAddress);

export default router;