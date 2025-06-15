import express from "express";
import createPayment from "../Controllers/PaymentController.js";
import stripeWebhook from "../Controllers/webhookController.js";

const router = express.Router();

// Route to create a payment intent
router.post('/webhook', stripeWebhook)
router.post("/create-payment-intent", createPayment);


export default router;
