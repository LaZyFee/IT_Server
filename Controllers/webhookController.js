import Stripe from "stripe";
import dotenv from "dotenv";
import { Order } from "../Models/OrderModel.js";
import { CustomPlan } from "../Models/CustomPlanModel.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripeWebhook = async (req, res) => {
  console.log("ENTERED INTO WEBHOOK");

  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook signature failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle payment success
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    console.log("✅ PaymentIntent succeeded.", paymentIntent.id);

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
  }

  res.status(200).json({ received: true });
};

export default stripeWebhook;
