import express from "express";
import { deleteOrder, getAllOrders, getOrderByPaymentIntent, getUserOrders, updateOrderStatus } from "../Controllers/OrderController.js";

const router = express.Router();

// Route to create a payment intent
router.get("/get-order", getOrderByPaymentIntent);
router.get("/all-order", getAllOrders);
router.get("/:id", getUserOrders);
router.patch("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);


export default router;
