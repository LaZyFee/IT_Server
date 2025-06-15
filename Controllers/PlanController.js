import { Plan } from "../Models/PlanModel.js";
import { Service } from "../Models/ServiceModel.js";

// Create a new plan
export const createPlan = async (req, res) => {
    try {
        const { title, features, price } = req.body;

        if (!Array.isArray(features) || features.length === 0) {
            return res.status(400).json({ message: "Features must be a non-empty array" });
        }

        const newPlan = new Plan({ title, features, price });
        const savedPlan = await newPlan.save();

        res.status(201).json(savedPlan);
    } catch (error) {
        res.status(500).json({ message: "Failed to create plan", error });
    }
};

// Get all plans
export const getAllPlans = async (req, res) => {
    try {
        const plans = await Plan.find();
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch plans", error });
    }
};

// Get a single plan by ID
export const getPlanById = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (!plan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        res.status(200).json(plan);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch plan", error });
    }
};

// Update a plan by ID
export const updatePlan = async (req, res) => {
    try {
        const { title, features, price } = req.body;

        if (features && (!Array.isArray(features) || features.length === 0)) {
            return res.status(400).json({ message: "Features must be a non-empty array" });
        }

        const updatedPlan = await Plan.findByIdAndUpdate(
            req.params.id,
            { title, features, price },
            { new: true }
        );

        if (!updatedPlan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        res.status(200).json(updatedPlan);
    } catch (error) {
        res.status(500).json({ message: "Failed to update plan", error });
    }
};

// Delete a plan by ID
export const deletePlan = async (req, res) => {
    try {
        const planId = req.params.id;

        // Check if any service is using this plan
        const serviceUsingPlan = await Service.findOne({ plan: planId });
        if (serviceUsingPlan) {
            return res.status(400).json({
                message: "Cannot delete plan because it is used by a service",
            });
        }

        const deletedPlan = await Plan.findByIdAndDelete(planId);

        if (!deletedPlan) {
            return res.status(404).json({ message: "Plan not found" });
        }

        res.status(200).json({ message: "Plan deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete plan", error });
    }
};
