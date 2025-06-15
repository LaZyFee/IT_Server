import Stripe from "stripe";
import dotenv from "dotenv";
import { User } from "../Models/UserModel.js";
import { Service } from "../Models/ServiceModel.js";
import { Plan } from "../Models/PlanModel.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createPayment = async (req, res) => {
  try {
    const { serviceId, planId,customPlanId, planName = "custom plan", serviceName, name, email, amount , description} = req.body;

    if (!name || !email || !amount) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Find service and plan
    let service, plan
    if(serviceId && planId){
      service = await Service.findById(serviceId) || null;
      plan = await Plan.findById(planId) || null;
    }

    const metadata = {
      userId: user._id.toString(),
      amount: amount.toString()
    };

    if (planId) metadata.planId = planId.toString();
    if (serviceId) 
      metadata.serviceId = serviceId.toString()
    

    if (planName) metadata.planName = planName;
    if (serviceName) {
      metadata.serviceName = serviceName;
      metadata.planDescription = description;
      metadata.customPlanId = customPlanId;
    }

    // Create Stripe PaymentIntent with metadata
    const paymentIntent = await stripe.paymentIntents.create({ 
      amount: amount * 100,
      currency: "usd",
      description: (serviceId && planId)?`Payment for ${plan?.title} under ${service?.title}`:`Payment for ${planName} under ${serviceName}`,
      metadata
    });

    return res.status(200).json({ 
      clientSecret: paymentIntent.client_secret,
      message: "PaymentIntent created" 
    });
  } catch (error) {
    console.error("Payment Error.", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export default createPayment;
