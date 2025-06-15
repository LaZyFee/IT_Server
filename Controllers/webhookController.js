import Stripe from "stripe";
import dotenv from "dotenv";
import { Order } from "../Models/OrderModel.js";
import { CustomPlan } from "../Models/CustomPlanModel.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripeWebhook = async (req, res) => {
  console.log("ENTERED INTO WEBHOOK");
  
  // Add debug logging
  console.log("Headers:", req.headers);
  console.log("Body type:", typeof req.body);
  console.log("Body length:", req.body ? req.body.length : 'undefined');

  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("❌ No Stripe signature found in headers");
    return res.status(400).send("No Stripe signature found");
  }

  if (!endpointSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is not set");
    return res.status(500).send("Webhook secret not configured");
  }

  let event;

  try {
    // Ensure we're using the raw body
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("✅ Webhook signature verified successfully");
  } catch (err) {
    console.error("❌ Webhook signature failed.", err.message);
    console.error("Full error:", err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Event type:", event.type);

  // Handle payment success
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    console.log("✅ PaymentIntent succeeded.", paymentIntent.id);

    try {
      const serviceId = paymentIntent?.metadata?.serviceId;
      const planId = paymentIntent?.metadata?.planId;
      const userId = paymentIntent?.metadata?.userId;
      const amount = parseFloat(paymentIntent?.metadata?.amount);
      const planName = paymentIntent?.metadata?.planName;
      const serviceName = paymentIntent?.metadata?.serviceName;
      const planDescription = paymentIntent?.metadata?.planDescription;
      const customPlanId = paymentIntent?.metadata?.customPlanId;

      // Create order after successful payment
      const newOrder = new Order({
        user: userId,
        service: serviceId || null,
        plan: planId || null,
        price: amount,
        description: `Payment for plan under service`,
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: "succeeded",
        status: "completed",
        planName,
        serviceName,
        planDescription,
      });

      await newOrder.save();

      if (customPlanId) {
        await CustomPlan.findByIdAndUpdate(customPlanId, {
          paymentStatus: "paid",
        });
        console.log(
          `✅ CustomPlan ${customPlanId} paymentStatus updated to paid.`
        );
      }

      console.log("✅ Order successfully created.", newOrder);
    } catch (dbError) {
      console.error("❌ Database error:", dbError);
      // Don't return error to Stripe - we've already verified the webhook
      // Log the error but acknowledge receipt
    }
  }

  res.status(200).json({ received: true });
};

export default stripeWebhook;