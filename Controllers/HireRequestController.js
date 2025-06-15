import { HireRequest } from "../Models/HireRequestModel.js";
import { User } from "../Models/UserModel.js";

// Create a hire request
export const createHireRequest = async (req, res) => {
    try {

        const { name, email, description, service, number, id } = req.body;

        if (!name || !email || !description || !service || !number) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const requestData = { name, email, description, service, number };

        if (id) {
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
            requestData.user = user._id;
        }

        const request = new HireRequest(requestData);
        const saved = await request.save();

        res.status(201).json(saved);
    } catch (error) {
        res.status(500).json({ message: "Failed to create hire request", error });
    }
};

// Admin: Get all requests
export const getAllHireRequests = async (req, res) => {
    try {
        const requests = await HireRequest.find().populate("user", "name email").sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch hire requests", error });
    }
};

// Admin: Update request status
export const updateHireRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["pending", "approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status." });
        }

        const updated = await HireRequest.findByIdAndUpdate(id, { status }, { new: true });

        if (!updated) {
            return res.status(404).json({ message: "Request not found." });
        }

        res.status(200).json(updated);
    } catch (error) {
        res.status(500).json({ message: "Failed to update request", error });
    }
};

// User: Get their hire requests
export const getUserHireRequests = async (req, res) => {
    try {
        const { id } = req.params;
        const requests = await HireRequest.find({ user: id }).sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch your hire requests", error });
    }
};
