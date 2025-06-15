import { CustomPlan } from "../Models/CustomPlanModel.js";
import { User } from "../Models/UserModel.js";

// Create a new custom plan
export const createCustomPlan = async (req, res) => {
    try {
        const { id } = req.params
        const { name, email, service, description, proposedPrice } = req.body;

        if (!name || !email || !service || !description || !proposedPrice) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const newPlan = new CustomPlan({
            user: user._id,
            name,
            email,
            service,
            description,
            proposedPrice,
        });

        const savedPlan = await newPlan.save();
        res.status(201).json(savedPlan);
    } catch (error) {
        res.status(500).json({ message: "Failed to submit custom plan", error });
    }
};

// Get all custom plans (admin view)
export const getAllCustomPlans = async (req, res) => {
    try {
        const plans = await CustomPlan.find().populate("user", "name email").sort({ createdAt: -1 });
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch custom plans", error });
    }
};

// Update custom plan status (admin action)
export const updateCustomPlanStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value." });
        }

        const updatedPlan = await CustomPlan.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({ message: "Custom plan not found." });
        }

        res.status(200).json(updatedPlan);
    } catch (error) {
        res.status(500).json({ message: "Failed to update plan status", error });
    }
};

// Get custom plans by user ID (user dashboard)
export const getUserCustomPlans = async (req, res) => {
    try {
        const { id } = req.params;
        const plans = await CustomPlan.find({ user: id }).sort({ createdAt: -1 });

        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch your custom plans", error });
    }
};