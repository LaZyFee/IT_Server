import Stripe from "stripe";
import dotenv from "dotenv";
import { Order } from "../Models/OrderModel.js";
import { CustomPlan } from "../Models/CustomPlanModel.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripeWebhook = async (req, res) => {
  console.log("ENTERED INTO WEBHOOK");
  console.log("Platform: Render/Production");

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
    console.log("Original body type:", typeof req.body);
    console.log("Is Buffer:", Buffer.isBuffer(req.body));
    console.log("Body constructor:", req.body?.constructor?.name);

    // Handle different body types across different hosting platforms
    if (Buffer.isBuffer(req.body)) {
      // Perfect - we have the raw buffer (this is what we want)
      body = req.body;
      console.log("✅ Using raw Buffer body");
    } else if (typeof req.body === 'string') {
      // Body is a string - convert to Buffer
      body = Buffer.from(req.body, 'utf8');
      console.log("✅ Converted string body to Buffer");
    } else if (typeof req.body === 'object' && req.body !== null) {
      // Body was parsed as JSON - convert back to string then Buffer
      const jsonString = JSON.stringify(req.body);
      body = Buffer.from(jsonString, 'utf8');
      console.log("⚠ Converted parsed JSON back to Buffer");
    } else {
      throw new Error(`Unexpected body type: ${typeof req.body}`);
    }

    console.log("Final body type:", typeof body);
    console.log("Final body length:", body.length);

    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    console.log("✅ Webhook signature verified successfully");
    console.log("Event type:", event.type);
  } catch (err) {
    console.error("❌ Webhook signature failed:", err.message);
    console.error("Headers:", JSON.stringify(req.headers, null, 2));
    console.error("Body sample:",
      typeof req.body === 'string'
        ? req.body.substring(0, 200)
        : Buffer.isBuffer(req.body)
          ? req.body.toString().substring(0, 200)
          : JSON.stringify(req.body).substring(0, 200)
    );
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle payment success events
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log("✅ PaymentIntent succeeded:", paymentIntent.id);

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
        description: `Payment for ${planName} under ${serviceName}`,
        stripePaymentIntentId: paymentIntent.id,
        paymentStatus: "succeeded",
        status: "completed",
        planName,
        serviceName,
        planDescription,
      });

      await newOrder.save();
      console.log("✅ Order created:", newOrder._id);

      if (customPlanId) {
        await CustomPlan.findByIdAndUpdate(customPlanId, {
          paymentStatus: "paid",
        });
        console.log(`✅ CustomPlan ${customPlanId} updated to paid`);
      }

    } else if (event.type === "charge.succeeded") {
      // Handle charge.succeeded as backup
      const charge = event.data.object;
      console.log("✅ Charge succeeded:", charge.id);

      // Similar processing logic as above...
      // You can add this if needed
    }

  } catch (dbError) {
    console.error("❌ Database error:", dbError);
    // Don't return error - webhook was valid, just log DB issues
  }

  console.log("✅ Webhook processed successfully");
  res.status(200).json({ received: true });
};

export default stripeWebhook;