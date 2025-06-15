import { Order } from "../Models/OrderModel.js";

const getOrderByPaymentIntent = async (req, res) => {
  try {
    const { payment_intent } = req.query;
    if (!payment_intent) {
      return res.status(400).json({ message: "Payment intent is required" });
    }

    const order = await Order.findOne({ stripePaymentIntentId: payment_intent })
      .populate("plan")
      .populate("service")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Build response object with conditional data based on plan type
    const responseOrder = {
      _id: order._id,
      user: order.user,
      price: order.price,
      paymentStatus: order.paymentStatus,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    if (order.plan && order.service) {
      // Regular plan
      responseOrder.plan = order.plan;
      responseOrder.service = order.service;
      responseOrder.description = order.description || order.planDescription || "";
      responseOrder.planName = order.plan.title || order.planName || "";
      responseOrder.serviceName = order.service.title || order.serviceName || "";
    } else {
      // Custom plan
      responseOrder.plan = null;
      responseOrder.service = null;
      responseOrder.planName = order.planName || "custom plan";
      responseOrder.serviceName = order.serviceName || "";
      responseOrder.description = order.planDescription || order.description || "";
    }

    return res.status(200).json({ order: responseOrder });
  } catch (error) {
    console.error("Error in getOrderByPaymentIntent:", error);
    return res.status(500).json({ message: error.message || "Something went wrong" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.params.id;
    const allOrders = await Order.find({ user: userId })
      .populate("plan", "title")
      .populate("service", "title")
      .populate("user", "name email"); // optional, if you want user info

    // Map orders to include planName, serviceName, description properly
    const formattedOrders = allOrders.map(order => {
      return {
        _id: order._id,
        user: order.user,
        price: order.price,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        plan: order.plan || null,
        service: order.service || null,
        planName: order.plan ? order.plan.title : order.planName || "custom plan",
        serviceName: order.service ? order.service.title : order.serviceName || "",
        description: order.description || order.planDescription || "",
        stripePaymentIntentId: order.stripePaymentIntentId,
      };
    });

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("plan", "title")
      .populate("service", "title");

    const formattedOrders = orders.map(order => ({
      _id: order._id,
      user: order.user,
      price: order.price,
      status: order.status,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      plan: order.plan || null,
      service: order.service || null,
      planName: order.plan ? order.plan.title : order.planName || "custom plan",
      serviceName: order.service ? order.service.title : order.serviceName || "",
      description: order.description || order.planDescription || "",
      stripePaymentIntentId: order.stripePaymentIntentId,
    }));

    res.json(formattedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { 
  getOrderByPaymentIntent, 
  getUserOrders, 
  getAllOrders, 
  updateOrderStatus,
  deleteOrder 
};
