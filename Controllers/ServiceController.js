import { Plan } from "../Models/PlanModel.js";
import { Service } from "../Models/ServiceModel.js";


// Create a service with plans
export const createService = async (req, res) => {
    try {
        const { title, description, image, plans } = req.body;

        // plans: array of { title, features (array), price }
        if (!Array.isArray(plans) || plans.length === 0) {
            return res.status(400).json({ message: "At least one plan is required" });
        }

        for (const plan of plans) {
            if (!Array.isArray(plan.features) || plan.features.length === 0) {
                return res.status(400).json({ message: "Each plan must have at least one feature" });
            }
        }

        // 1. Create all plans
        const createdPlans = await Plan.insertMany(plans);
        const planIds = createdPlans.map(plan => plan._id);

        // 2. Create the service
        const newService = new Service({
            title,
            description,
            image,
            plan: planIds,
        });

        const savedService = await newService.save();

        res.status(201).json(savedService);
    } catch (error) {
        console.error("Error creating service with plans:", error);
        res.status(500).json({ message: "Failed to create service with plans", error });
    }
};


// Get all services
export const getAllServices = async (req, res) => {
    try {
        const services = await Service.find().populate("plan");
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch services", error });
    }
};

// Get a single service by ID
export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate("plan");

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch service", error });
    }
};

// Update a service by ID
export const updateService = async (req, res) => {
    try {
        const { title, features, image, plan } = req.body;

        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            { title, features, image, plan },
            { new: true }
        ).populate("plan");

        if (!updatedService) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.status(200).json(updatedService);
    } catch (error) {
        res.status(500).json({ message: "Failed to update service", error });
    }
};

// Delete service and its plans
export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Delete associated plans
        await Plan.deleteMany({ _id: { $in: service.plan } });

        // Delete the service itself
        await service.deleteOne();

        res.status(200).json({ message: "Service and associated plans deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete service", error });
    }
};
