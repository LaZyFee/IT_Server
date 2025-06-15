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

  if (!sig) {
    console.error("❌ No Stripe signature found in headers");
    return res.status(400).send("No Stripe signature found");
  }

  if (!endpointSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET is not set");
    return res.status(500).send("Webhook secret not configured");
  }

  let event;
  let body;

  try {
    // Handle different body types - Vercel may parse JSON automatically
    if (typeof req.body === 'string') {
      body = req.body;
    } else if (Buffer.isBuffer(req.body)) {
      body = req.body;
    } else if (typeof req.body === 'object') {
      // Vercel parsed it as JSON - convert back to string
      body = JSON.stringify(req.body);
      console.log("⚠ Body was parsed as JSON, converting back to string");
    } else {
      throw new Error("Unexpected body type: " + typeof req.body);
    }

    console.log("Body type after processing:", typeof body);
    console.log("Body length after processing:", body.length);

    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log("✅ Webhook signature verified successfully");
  } catch (err) {
    console.error("❌ Webhook signature failed.", err.message);
    console.error("Body type:", typeof req.body);
    console.error("Body sample:", typeof req.body === 'string' ? req.body.substring(0, 100) : JSON.stringify(req.body).substring(0, 100));
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Event type:", event.type);

  try {
    // Handle payment success - both charge.succeeded and payment_intent.succeeded
    if (event.type === "payment_intent.succeeded" || event.type === "charge.succeeded") {
      let paymentData;

      if (event.type === "payment_intent.succeeded") {
        paymentData = event.data.object;
      } else if (event.type === "charge.succeeded") {
        // For charge.succeeded, get the payment intent ID and fetch it
        const charge = event.data.object;
        paymentData = {
          id: charge.payment_intent,
          metadata: charge.metadata,
          amount: charge.amount
        };
      }

      console.log("✅ Payment succeeded.", paymentData.id);

      const serviceId = paymentData?.metadata?.serviceId;
      const planId = paymentData?.metadata?.planId;
      const userId = paymentData?.metadata?.userId;
      const amount = parseFloat(paymentData?.metadata?.amount || (paymentData.amount / 100));
      const planName = paymentData?.metadata?.planName;
      const serviceName = paymentData?.metadata?.serviceName;
      const planDescription = paymentData?.metadata?.planDescription;
      const customPlanId = paymentData?.metadata?.customPlanId;

      // Create order after successful payment
      const newOrder = new Order({
        user: userId,
        service: serviceId || null,
        plan: planId || null,
        price: amount,
        description: `Payment for ${planName} under ${serviceName}`,
        stripePaymentIntentId: paymentData.id,
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
        console.log(`✅ CustomPlan ${customPlanId} paymentStatus updated to paid.`);
      }

      console.log("✅ Order successfully created:", newOrder._id);
    }
  } catch (dbError) {
    console.error("❌ Database error:", dbError);
    // Don't return error to Stripe - we've already verified the webhook
    // Log the error but acknowledge receipt
  }

  res.status(200).json({ received: true });
};

export default stripeWebhook;